'use strict';

class PluginAutoSyncGoalEnd2EndMinEy {
    // Plug-in Metadata
    static get Name()     { return 'Minimise End-to-End Response Times (EY)'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginAutoSync.Category.Goal; }

    
    // Updates the task parameters to miminise end-to-end reponse times.
    // Iteratively schedules the tasks based on timing constraint priorities,
    // and contracts the LET intervals based on min/max execution intervals.
    static async Result(scheduler) {
        // Retrieve the LET system.
        const systemElementSelected = ['tasks', 'eventChains', 'constraints'];
        const system = await PluginAutoSync.DatabaseContentsGet(systemElementSelected);
        const tasks = await system[Model.TaskStoreName];
        const eventChains = await system[Model.EventChainStoreName];
        const constraints = await system[Model.ConstraintStoreName];
        
        if (constraints.length == 0) {
            alert('Aborting because no timing constraints have been defined!');
            return;
        }
                
        // Create task dependency graph and assign task priorities for the heuristic.
        const graph = this.CreateTaskDependencyGraph(eventChains, constraints);
        if (graph == null) {
            return;
        }
                
        // Run iterative optimisation heuristic.
        await this.Algorithm(tasks, graph, scheduler);

        const taskElementSelected = ['tasks'];
        return PluginAutoSync.DatabaseContentsDelete(taskElementSelected)
            .then(PluginAutoSync.DatabaseContentsSet(system, taskElementSelected));
    }
    
    static getTaskParameters(name, tasks) {
        return tasks.filter(task => task.name == name)[0];
    }
    
    static GetRequiredConstraintDetails(eventChains, constraints) {
        // Initialise the event chain details required by the timing constraints.
        // Map schema is { eventChainName: { tasks: ?, priority: ?}, ... }
        let requiredEventChainDetails = new Map();
        for (const constraint of constraints) {
            const priority = constraint.priority || 0;
            if (!requiredEventChainDetails.has(constraint.eventChain)) {
                requiredEventChainDetails.set(constraint.eventChain, new Map());
                requiredEventChainDetails.get(constraint.eventChain).set('priority', priority);
            } else {
                const existingPriority = requiredEventChainDetails.get(constraint.eventChain).get('priority');
                requiredEventChainDetails.get(constraint.eventChain).set('priority', Math.max(existingPriority, priority));
            }
        }
            
        // Flatten each required event chain into a task sequence, and
        // extract the required task dependencies.
        let taskDependencies = [ ];
        for (const eventChain of eventChains.filter(eventChain => requiredEventChainDetails.has(eventChain.name))) {
            let eventChainFlattened = [ ];
            let eventChainSuccessor = eventChain;
            
            // Record the task at the start of the chain.
            if (eventChainSuccessor.segment.source.task != Model.SystemInterfaceName) {
                eventChainFlattened.push(eventChainSuccessor.segment.source.task);
            }
            
            // Traverse the segments in the event chain and record the tasks.
            while (true) {
                if (eventChainSuccessor.segment.destination.task != Model.SystemInterfaceName) {
                    eventChainFlattened.push(eventChainSuccessor.segment.destination.task);
                }
                
                if (eventChainSuccessor.segment.source.task != Model.SystemInterfaceName
                        && eventChainSuccessor.segment.destination.task != Model.SystemInterfaceName) {
                    taskDependencies.push([eventChainSuccessor.segment.source.task, eventChainSuccessor.segment.destination.task]);
                }
                
                if (eventChainSuccessor.successor == undefined) {
                    break;
                }
                eventChainSuccessor = eventChainSuccessor.successor;
            }

            requiredEventChainDetails.get(eventChain.name).set('tasks', eventChainFlattened);
        }
        
        // Set of tasks from the required event chains
        let tasksRequired = new Set(Array.from(taskDependencies.values()).flat());
        
        return [requiredEventChainDetails, taskDependencies, tasksRequired];
    }
    
    static CreateTaskDependencyGraph(eventChains, constraints) {
        // requiredEventChainDetails: event chain priority, task sequence
        // taskDependencies: task dependency edges
        // tasksRequired: task set
        const [requiredEventChainDetails, taskDependencies, tasksRequired] = this.GetRequiredConstraintDetails(eventChains, constraints);
        
        // Represent the task dependency graph as an adjacency matrix.
        // Dependency graph is directed so that cycles can be checked.
        //
        // Example event chains:
        //   t1 ---------> t4 --> t5
        //   t2 --> t3 --> t4 --> t6
        //
        // Adjacency matrix TDG[row][col]:
        //
        //              Source task (col)
        //            | t1 t2 t3 t4 t5 t6
        //         ---+-------------------
        // Target  t1 |
        // task    t2 |
        // (row)   t3 |    X
        //         t4 | X     X
        //         t5 |          X
        //         t6 |          X
        //
        // From the Adjacency matrix, we can see that t4 has
        // two incoming edges (from t1 and t3), so it is a
        // common task. We can also see that t4 has two
        // outgoing edges (to t5 and t6).
        //
        let graph = new this.AdjacencyMatrix(tasksRequired);
        taskDependencies.forEach(dependency => graph.setDirectedEdge(dependency[0], dependency[1]));
        
        // Check that the task dependency graph is acyclic.
        const graphCycle = graph.cycle;
        if (graphCycle.length > 0) {
            alert(`Aborting because a task dependency cycle was detected in the timing constraints! \n\n${graphCycle.join(' → ')}`)
            return null;
        }
        
        // Assign local task priorities based on the event chain priorities.
        for (const [eventChainName, details] of requiredEventChainDetails) {
            const tasks = details.get('tasks');
            const priority = details.get('priority');
            tasks.forEach(task => graph.updateNodeLocalPriorityMax(task, priority));
        }
        
        // Compute the global task priorities.
        graph.computeGlobalTaskPriorities();
        
        return graph;
    }

    // Iteratively schedules each task from highest to lowest priority to determine the
    // min and max bounds of their LET intervals.
    // FIXME: Also need to schedule the tasks not in the dependency graph.
    static async Algorithm(tasks, taskDependencyGraph, scheduler) {
        // Scheduling parameters
        const initialOffsets = tasks.map(taskParameters => taskParameters.initialOffset).flat();
        const periods = tasks.map(taskParameters => taskParameters.period).flat();
        const prologue = Utility.MaxOfArray(initialOffsets);
        const hyperPeriod = Utility.LeastCommonMultipleOfArray(periods);
        const makespan = prologue + hyperPeriod;
        const executionTiming = 'WCET';
        
        
        let currentTaskSet = new Set();
        let firstTaskInstanceOfInterest = { };
        let predecessorTaskName = null;
        const tasksDescendingPriority = taskDependencyGraph.nodesDescendingGlobalPriorities;
        for (const currentTaskName of tasksDescendingPriority) {
            // Delete the existing task schedule.
            await PluginAutoSync.DeleteSchedule();
            
            // Expand the current task's LET interval to span its entire period,
            // and remove the initial offset.
            let currentTask = tasks.find(task => (task.name == currentTaskName));
            currentTask.initialOffset = 0;
            currentTask.activationOffset = 0;
            currentTask.duration = currentTask.period;
            currentTask.priority = taskDependencyGraph.getNodeGlobalPriority(currentTaskName);
            
            // Add the currentTask into the task set to schedule.
            currentTaskSet.add(currentTask);

            // Schedule the current task set.
            for (const task of currentTaskSet) {
                await PluginAutoSync.CreateTaskInstances(task, makespan, executionTiming);
            }
            let schedule = await PluginAutoSync.GetSchedule();
            let allTasksInstances = await schedule['promiseAllTasksInstances'];
            await scheduler.Algorithm(allTasksInstances, makespan, tasks);
            
            // Get the currentTask's instances.
            let currentTaskInstances = allTasksInstances.find(task => (task.name == currentTaskName));
            if (currentTaskInstances.value.length == 0) {
                console.warn(`No task instances available for ${currentTaskName} to compute its LET bounds!`);
                predecessorTaskName = currentTaskName;
                continue;
            }

            // Analyse the currentTask parameters.
            if (predecessorTaskName == null) {
                // No predecessors so just contract the currentTask's LET interval to the execution intervals
                // of its initial instance.
                let letBound = { 'min': currentTask.period, 'max': 0 };
                const firstTaskInstance = currentTaskInstances.value[0];
                for (const executionInterval of firstTaskInstance.executionIntervals) {
                    letBound.min = Math.min(letBound.min, executionInterval.startTime - firstTaskInstance.periodStartTime);
                    letBound.max = Math.max(letBound.max, executionInterval.endTime - firstTaskInstance.periodStartTime);
                }
                currentTask.activationOffset = letBound.min;
                currentTask.duration = letBound.max - letBound.min;
                
                // Save the details of the first task instance.
                const firstPeriodStartTime = firstTaskInstance.periodStartTime;
                const firstPeriodEndTime = firstTaskInstance.periodEndTime;
                firstTaskInstanceOfInterest[currentTaskName] = {
                    'letStartTime': firstPeriodStartTime + currentTask.activationOffset,
                    'letEndTime': firstPeriodStartTime + currentTask.activationOffset + currentTask.duration
                };
            } else {
                // Get the latest LET end of the predecessors.
                const maxPredecessorLetEndTime = firstTaskInstanceOfInterest[predecessorTaskName].letEndTime;
            
                // Find the earliest instance of currentTask that can complete its computations after maxPredecessorLetEndTime.
                // 1. Shift the currentTask's LET activation offset to the earliest possible time.
                let letBound = { 'min': currentTask.period, 'max': 0 };
                for (const instance of currentTaskInstances.value) {
                    if (instance.periodStartTime <= maxPredecessorLetEndTime && maxPredecessorLetEndTime <= instance.periodEndTime) {
                        if (maxPredecessorLetEndTime + currentTask.wcet <= instance.periodEndTime) {
                            currentTask.activationOffset = maxPredecessorLetEndTime - instance.periodStartTime;
                        } else  {
                            currentTask.activationOffset = 0;
                        }
                        currentTask.duration = currentTask.period - currentTask.activationOffset;
                        
                        firstTaskInstanceOfInterest[currentTaskName] = {
                            'letStartTime': instance.periodStartTime + currentTask.activationOffset
                        };
                        
                        break;
                    }
                }
                
                // 2. Reschedule to determine the earliest LET end time.
                for (const task of currentTaskSet) {
                    await PluginAutoSync.CreateTaskInstances(task, makespan, executionTiming);
                }
                schedule = await PluginAutoSync.GetSchedule();
                allTasksInstances = await schedule['promiseAllTasksInstances'];
                await scheduler.Algorithm(allTasksInstances, makespan, tasks);
                
                // Get the currentTask's instances again.
                currentTaskInstances = allTasksInstances.find(task => (task.name == currentTaskName));
                if (currentTaskInstances.value.length == 0) {
                    console.error(`No task instances available for ${currentTaskName} to compute its LET bounds!`);
                    return;
                }
                
                let maxLetEndTime = 0;
                for (const instance of currentTaskInstances.value) {
                    for (const executionInterval of instance.executionIntervals) {
                        maxLetEndTime = Math.max(maxLetEndTime, executionInterval.endTime - instance.periodStartTime);
                    }
                }
                
                currentTask.duration = maxLetEndTime - currentTask.activationOffset;
                firstTaskInstanceOfInterest[currentTaskName]['letEndTime'] =
                    firstTaskInstanceOfInterest[currentTaskName]['letStartTime'] + currentTask.duration;
                    
                // FIXME: Reschedule and trim the slack from the end of the task instances.
            }
            
            predecessorTaskName = currentTaskName;
        }
    }

    static async AlgorithmOld(tasks, tasksDescendingPriority, scheduler) {
        // Scheduling parameters
        const initialOffsets = tasks.map(taskParameters => taskParameters.initialOffset).flat();
        const periods = tasks.map(taskParameters => taskParameters.period).flat();
        const prologue = Utility.MaxOfArray(initialOffsets);
        const hyperPeriod = Utility.LeastCommonMultipleOfArray(periods);
        const makespan = prologue + hyperPeriod;
        const executionTiming = 'WCET';
        
        let currentTaskSet = new Set();
        for (const currentTaskName of tasksDescendingPriority) {
            // Delete the existing task schedule.
            await PluginAutoSync.DeleteSchedule();
            
            // Expand the current task's LET interval to span its entire period.
            let currentTask = tasks.find(task => (task.name == currentTaskName));
            currentTask.activationOffset = 0;
            currentTask.duration = currentTask.period;
            
            // Add the currentTask into the current task set to schedule.
            currentTaskSet.add(currentTask);

            // Schedule the current task set.
            for (const task of currentTaskSet) {
                await PluginAutoSync.CreateTaskInstances(task, makespan, executionTiming);
            }
            const schedule = await PluginAutoSync.GetSchedule();
            const allTasksInstances = await schedule['promiseAllTasksInstances'];
            await scheduler.Algorithm(allTasksInstances, makespan, tasks);
            
            // Analyse the currentTask parameters.
            // FIXME: LET min/max bounds are incorrect when the task instance has zero execution time.
            let letBound = { 'min': currentTask.period, 'max': 0 };
            const currentTaskInstances = allTasksInstances.find(task => (task.name == currentTaskName));
            for (const instance of currentTaskInstances.value) {
                for (const executionInterval of instance.executionIntervals) {
                    letBound.min = Math.min(letBound.min, executionInterval.startTime - instance.periodStartTime);
                    letBound.max = Math.max(letBound.max, executionInterval.endTime - instance.periodStartTime);
                }
            }
            
            if (letBound.min > letBound.max) {
                console.error(`LET bounds could not be computed for ${currentTaskName}!`);
            }
            
            currentTask.activationOffset = letBound.min;
            currentTask.duration = letBound.max - letBound.min;
        }
    }

}

PluginAutoSyncGoalEnd2EndMinEy.AdjacencyMatrix = class {
    sources = null;     // Mapping of nodes to indices.
    targets = null;     // Mapping of nodes to indices.
    matrix = null;      // Adjacency matrix as a 2D array.
    priorities = null;  // Node priorities: local to a path, and global to entire graph.

    constructor(nodes) {
        // Map each source to a column index.
        // Map each target to a row index.
        // Initialise the task priorities.
        let index = 0;
        this.sources = new Map();
        this.targets = new Map();
        this.priorities = new Map();
        for (const node of nodes) {
            this.sources.set(node, index);
            this.targets.set(node, index);
            this.priorities.set(node, new Map([['local', 0], ['global', null]]));
            index++;
        }
        
        // Initialise the matrix.
        this.matrix = [ ];
        for (let j = 0; j < index; j++) {
            let row = new Array(index);
            row.fill(false);
            this.matrix.push(row);
        }
    }
    
    getNode(mapping, indexQuery) {
        for (const [node, index] of mapping) {
            if (indexQuery == index) {
                return node;
            }
        }
    }

    getSourceIndex(node) {
        return this.sources.get(node);
    }
    
    getTargetIndex(node) {
        return this.targets.get(node);
    }
    
    setDirectedEdge(source, target) {
        const row = this.getTargetIndex(target);
        const col = this.getSourceIndex(source);
        this.matrix[row][col] = true;
    }
    
    clearDirectedEdge(source, target) {
        const row = this.getTargetIndex(target);
        const col = this.getSourceIndex(source);
        this.matrix[row][col] = false;
    }
    
    get nodesDescendingGlobalPriorities() {
        return this.sortNodeList([...this.priorities.keys()], this.compareDescendingGlobalPriority);
    }
    
    getNodePriority(node, type) {
        return this.priorities.get(node).get(type);
    }
    
    getNodeLocalPriority(node) {
        return this.getNodePriority(node, 'local');
    }

    getNodeGlobalPriority(node) {
        return this.getNodePriority(node, 'global');
    }

    setNodePriority(node, type, priority) {
        this.priorities.get(node).set(type, priority);
    }

    updateNodePriorityMax(node, type, priority) {
        const existingPriority = this.getNodePriority(node, type);
        const maxPriority = Math.max(existingPriority, priority);
        this.setNodePriority(node, type, maxPriority)
    }

    updateNodeLocalPriorityMax(node, priority) {
        this.updateNodePriorityMax(node, 'local', priority)
    }
    
    updateNodeGlobalPriorityMax(node, priority) {
        this.updateNodePriorityMax(node, 'global', priority)
    }

    get startNodes() {
        let startNodes = [ ];
        for (const [name, row] of this.targets.entries()) {
            const hasIncomingEdge = this.matrix[row].reduce((left, right) => left || right, false);
            if (!hasIncomingEdge) {
                startNodes.push(name);
            }
        }
        
        return startNodes;
    }
    
    getTargetNodes(sourceNode) {
        const col = this.getSourceIndex(sourceNode);
        let targetNodes = [ ];
        for (const [name, row] of this.targets.entries()) {
            if (this.matrix[row][col]) {
                targetNodes.push(name);
            }
        }
        
        return targetNodes;
    }
    
    getSourceNodes(targetNode) {
        const row = this.getTargetIndex(targetNode);
        let sourceNodes = [ ];
        for (const [index, isSource] of this.matrix[row].entries()) {
            if (isSource) {
                sourceNodes.push(this.getNode(this.sources, index));
            }
        }
        
        return sourceNodes;
    }
    
    // Returns the earliest predecessor nodes that have not been assigned a global priority.
    getRootSourceNodes(targetNode) {
        let rootSourceNodes = new Set();
        const sourceNodes = this.getSourceNodes(targetNode);
        const sourceNodesWithoutGlobalPriority = sourceNodes.filter(node => (this.getNodeGlobalPriority(node) == null));
        if (sourceNodesWithoutGlobalPriority.length == 0) {
            rootSourceNodes.add(targetNode);
        } else {
            for (const sourceNode of sourceNodesWithoutGlobalPriority) {
                rootSourceNodes = new Set([...rootSourceNodes, ...this.getRootSourceNodes(sourceNode)]);
            }
        }
        return rootSourceNodes;
    }
    
    compareDescendingLocalPriority(left, right) {
        if (this.getNodeLocalPriority(left) > this.getNodeLocalPriority(right)) {
            return -1;
        }
        if (this.getNodeLocalPriority(left) < this.getNodeLocalPriority(right)) {
            return 1;
        }
        return 0;
    }
    
    compareDescendingGlobalPriority(left, right) {
        if (this.getNodeGlobalPriority(left) > this.getNodeGlobalPriority(right)) {
            return -1;
        }
        if (this.getNodeGlobalPriority(left) < this.getNodeGlobalPriority(right)) {
            return 1;
        }
        return 0;
    }
    
    sortNodeList(nodeList, comparator) {
        return nodeList.sort(comparator.bind(this));
    }
    
    nodeIsShared(node) {
        const row = this.targets.get(node);
        return (this.matrix[row].reduce((left, right) => left + right, 0) > 1);
    }
    
    // Depth-first search to find cycles in the graph.
    get cycle() {
        let visited = new Set();   // Stores the visited nodes.
        let path = [ ];            // Stores the current graph traversal.
        
        for (const startNode of this.startNodes) {
            visited.add(startNode);
            path.push(startNode);
            if (this.getCycleHelper(visited, path, startNode)) {
                break;
            }
        }
        
        return path;
    }
    
    // Recursively visit target nodes until a cycle is found or until the path terminates.
    getCycleHelper(visited, path, node) {
        for (const targetNode of this.getTargetNodes(node)) {
            if (path.find(node => (node == targetNode))) {
                return true;
            } else if (!visited.has(targetNode)) {
                visited.add(targetNode);
                path.push(targetNode);
                if (this.getCycleHelper(visited, path, targetNode)) {
                    return true;
                }
            }
        }
    
        path.pop();
        return false;
    }
    
    // Depth-first traversal with backtracking to assign global priorities to nodes,
    // based on node local priorities. Priority of a shared node is always lower than
    // the priorities of its predecessors.
    // FIXME: However, this approach suffers from the well-known priority inversion problem.
    computeGlobalTaskPriorities() {
        let currentPriority = { val: this.priorities.size };    // Primitives are passed as values into functions.
        const startNodesDescendingPriority = this.sortNodeList(this.startNodes, this.compareDescendingLocalPriority);
        for (const startNode of startNodesDescendingPriority) {
            this.computeGlobalTaskPrioritiesHelper(startNode, currentPriority);
        }
    }
    
    // Recursively visit target nodes until the path terminates.
    computeGlobalTaskPrioritiesHelper(node, currentPriority) {
        if (this.getNodeGlobalPriority(node) == null) {
            this.updateNodeGlobalPriorityMax(node, currentPriority.val);
            currentPriority.val--;
            
            const targetNodesDescendingPriority = this.sortNodeList(this.getTargetNodes(node), this.compareDescendingLocalPriority);
            for (const targetNode of targetNodesDescendingPriority) {
                if (this.nodeIsShared(targetNode)) {
                    // Backtrack to all possible start nodes that can reach the targetNode.
                    const rootSourceNodes = [...this.getRootSourceNodes(targetNode)];
                    const sourceNodesDescendingPriority = this.sortNodeList(rootSourceNodes, this.compareDescendingLocalPriority);
                    for (const sourceNode of sourceNodesDescendingPriority) {
                        this.computeGlobalTaskPrioritiesHelper(sourceNode, currentPriority);
                    }
                }
                
                this.computeGlobalTaskPrioritiesHelper(targetNode, currentPriority);
            }
        }
    }
    
    toString() {
        const sources = Array.from(this.sources.entries()).map(entry => `${entry[0]}:${entry[1]}`);
        const targets = Array.from(this.targets.entries()).map(entry => `${entry[0]}:${entry[1]}`);
        return [`Sources: ${sources.join(', ')}`, `Targets: ${targets.join(', ')}`, this.matrix.join('\n')].join('\n');
    }
}

class PluginAutoSyncGoalEnd2EndMinEyTest {
    static Run() {
        this.Test1();
        this.Test2();
        this.Test3();
        this.Test4();
    }

    // Example event chains:
    //   Priority 3: t1 ---> t2 ---> t3 --> t4 --> t5 --> t6
    //   Priority 1: t1 ---> t7 ---> t8 --> t9 --> t5 --> t6
    //   Priority 2: t10 --> t11 --> t8
    //
    // Adjacency matrix TDG[row][col]:
    //
    //                 Source task (col)
    //            | t1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11
    //         ---+-----------------------------------
    // Target  t1 |
    // task    t2 | X
    // (row)   t3 |    X
    //         t4 |       X
    //         t5 |          X              X
    //         t6 |             X
    //         t7 | X
    //         t8 |                   X            X
    //         t9 |                      X
    //        t10 |
    //        t11 |                            X
    //
    //
    // Global task priority:
    //   t1 > t2 > t3 > t4 > t10 > t11 > t7 > t8 > t9 > t5 > t6
    //
    static Test1() {
        const tasksRequiredTest = new Set(['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11']);
        let graphTest = new PluginAutoSyncGoalEnd2EndMinEy.AdjacencyMatrix(tasksRequiredTest);
        
        const taskDependenciesTest = [
            ['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5'], ['t5', 't6'],
            ['t1', 't7'], ['t7', 't8'], ['t8', 't9'], ['t9', 't5'],
            ['t10', 't11'], ['t11', 't8']
        ];
        taskDependenciesTest.forEach(dependency => graphTest.setDirectedEdge(dependency[0], dependency[1]));
        console.log(graphTest.toString());
        
        const graphCycle = graphTest.cycle;
        if (graphCycle.length > 0) {
            console.error(`Test1: Aborting because a task dependency cycle was detected! \n\n${graphCycle.join(' → ')}`)
            return;
        }

        ['t1', 't2', 't3', 't4', 't5', 't6'].forEach(task => graphTest.updateNodeLocalPriorityMax(task, 3));
        ['t1', 't7', 't8', 't9', 't5', 't6'].forEach(task => graphTest.updateNodeLocalPriorityMax(task, 1));
        ['t10', 't11', 't8'].forEach(task => graphTest.updateNodeLocalPriorityMax(task, 2));
        graphTest.computeGlobalTaskPriorities();
        console.log(graphTest.nodesDescendingGlobalPriorities);

        const expectedGlobalPriorities = ['t1', 't2', 't3', 't4', 't10', 't11', 't7', 't8', 't9', 't5', 't6'];
        const isCorrect = graphTest.nodesDescendingGlobalPriorities.length === expectedGlobalPriorities.length
                          && graphTest.nodesDescendingGlobalPriorities.every((value, index) => value === expectedGlobalPriorities[index]);
        console.assert(isCorrect, 'Computed global task priorities are incorrect!');
        
        return;
    }

    // Example event chains:
    //   Priority 1: t1 ---> t2 ---> t3 --> t4 --> t5 --> t6
    //   Priority 2: t1 ---> t7 ---> t8 --> t9 --> t5 --> t6
    //   Priority 3: t10 --> t11 --> t8
    //
    // Adjacency matrix TDG[row][col]:
    //
    //                      Source task (col)
    //            | t1 t2 t3 t4 t5 t6 t7 t8 t9 t10 t11
    //         ---+------------------------------------
    // Target  t1 |
    // task    t2 | X
    // (row)   t3 |    X
    //         t4 |       X
    //         t5 |          X              X
    //         t6 |             X
    //         t7 | X
    //         t8 |                   X            X
    //         t9 |                      X
    //        t10 |
    //        t11 |                            X
    //
    //
    // Global task priority:
    //   t1 > t2 > t3 > t4 > t10 > t11 > t7 > t8 > t9 > t5 > t6
    //
    static Test2() {
        const tasksRequiredTest = new Set(['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11']);
        let graphTest = new PluginAutoSyncGoalEnd2EndMinEy.AdjacencyMatrix(tasksRequiredTest);
        
        const taskDependenciesTest = [
            ['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5'], ['t5', 't6'],
            ['t1', 't7'], ['t7', 't8'], ['t8', 't9'], ['t9', 't5'],
            ['t10', 't11'], ['t11', 't8']
        ];
        taskDependenciesTest.forEach(dependency => graphTest.setDirectedEdge(dependency[0], dependency[1]));
        console.log(graphTest.toString());
        
        const graphCycle = graphTest.cycle;
        if (graphCycle.length > 0) {
            console.error(`Test1: Aborting because a task dependency cycle was detected! \n\n${graphCycle.join(' → ')}`)
            return;
        }

        ['t1', 't2', 't3', 't4', 't5', 't6'].forEach(task => graphTest.updateNodeLocalPriorityMax(task, 1));
        ['t1', 't7', 't8', 't9', 't5', 't6'].forEach(task => graphTest.updateNodeLocalPriorityMax(task, 2));
        ['t10', 't11', 't8'].forEach(task => graphTest.updateNodeLocalPriorityMax(task, 3));
        graphTest.computeGlobalTaskPriorities();
        console.log(graphTest.nodesDescendingGlobalPriorities);

        const expectedGlobalPriorities = ['t10', 't11', 't1', 't7', 't8', 't9', 't2', 't3', 't4', 't5', 't6'];
        const isCorrect = graphTest.nodesDescendingGlobalPriorities.length === expectedGlobalPriorities.length
                          && graphTest.nodesDescendingGlobalPriorities.every((value, index) => value === expectedGlobalPriorities[index]);
        console.assert(isCorrect, 'Computed global task priorities are incorrect!');
        
        return;
    }

    // Example event chains:
    //   Priority 2: t1 --> t2 --> t3 --> t4 --> t5
    //   Priority 1: t6 --> t2 --> t7 --> t4 --> t8
    //
    // Adjacency matrix TDG[row][col]:
    //
    //                 Source task (col)
    //            | t1 t2 t3 t4 t5 t6 t7 t8
    //         ---+-------------------------
    // Target  t1 |
    // task    t2 | X              X
    // (row)   t3 |    X
    //         t4 |       X           X
    //         t5 |          X
    //         t6 |
    //         t7 |    X
    //         t8 |          X
    //
    //
    // Global task priority:
    //   t1 > t6 > t2 > t3 > t7 > t4 > t5 > t8
    //
    static Test3() {
        const tasksRequiredTest = new Set(['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8']);
        let graphTest = new PluginAutoSyncGoalEnd2EndMinEy.AdjacencyMatrix(tasksRequiredTest);
        
        const taskDependenciesTest = [
            ['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5'],
            ['t6', 't2'], ['t2', 't7'], ['t7', 't4'], ['t4', 't8']
        ];
        taskDependenciesTest.forEach(dependency => graphTest.setDirectedEdge(dependency[0], dependency[1]));
        console.log(graphTest.toString());
        
        const graphCycle = graphTest.cycle;
        if (graphCycle.length > 0) {
            console.error(`Test1: Aborting because a task dependency cycle was detected! \n\n${graphCycle.join(' → ')}`)
            return;
        }

        ['t1', 't2', 't3', 't4', 't5'].forEach(task => graphTest.updateNodeLocalPriorityMax(task, 2));
        ['t6', 't2', 't7', 't4', 't8'].forEach(task => graphTest.updateNodeLocalPriorityMax(task, 1));
        graphTest.computeGlobalTaskPriorities();
        console.log(graphTest.nodesDescendingGlobalPriorities);

        const expectedGlobalPriorities = ['t1', 't6', 't2', 't3', 't7', 't4', 't5', 't8'];
        const isCorrect = graphTest.nodesDescendingGlobalPriorities.length === expectedGlobalPriorities.length
                          && graphTest.nodesDescendingGlobalPriorities.every((value, index) => value === expectedGlobalPriorities[index]);
        console.assert(isCorrect, 'Computed global task priorities are incorrect!');
        
        return;
    }

    // Example event chains:
    //   Priority 2: t1 --> t2 --> t3
    //   Priority 1: t4 --> t5 --> t6
    //
    // Adjacency matrix TDG[row][col]:
    //
    //              Source task (col)
    //            | t1 t2 t3 t4 t5 t6
    //         ---+-------------------
    // Target  t1 |
    // task    t2 | X
    // (row)   t3 |    X
    //         t4 |
    //         t5 |          X
    //         t6 |             X
    //
    //
    // Global task priority:
    //   t1 > t2 > t3 > t4 > t5 > t6
    //
    static Test4() {
        const tasksRequiredTest = new Set(['t1', 't2', 't3', 't4', 't5', 't6']);
        let graphTest = new PluginAutoSyncGoalEnd2EndMinEy.AdjacencyMatrix(tasksRequiredTest);
        
        const taskDependenciesTest = [
            ['t1', 't2'], ['t2', 't3'],
            ['t4', 't5'], ['t5', 't6']
        ];
        taskDependenciesTest.forEach(dependency => graphTest.setDirectedEdge(dependency[0], dependency[1]));
        console.log(graphTest.toString());
        
        const graphCycle = graphTest.cycle;
        if (graphCycle.length > 0) {
            console.error(`Test1: Aborting because a task dependency cycle was detected! \n\n${graphCycle.join(' → ')}`)
            return;
        }

        ['t1', 't2', 't3'].forEach(task => graphTest.updateNodeLocalPriorityMax(task, 2));
        ['t4', 't5', 't6'].forEach(task => graphTest.updateNodeLocalPriorityMax(task, 1));
        graphTest.computeGlobalTaskPriorities();
        console.log(graphTest.nodesDescendingGlobalPriorities);

        const expectedGlobalPriorities = ['t1', 't2', 't3', 't4', 't5', 't6'];
        const isCorrect = graphTest.nodesDescendingGlobalPriorities.length === expectedGlobalPriorities.length
                          && graphTest.nodesDescendingGlobalPriorities.every((value, index) => value === expectedGlobalPriorities[index]);
        console.assert(isCorrect, 'Computed global task priorities are incorrect!');
        
        return;
    }
}

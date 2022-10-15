'use strict';

class PluginAutoSyncGoalEnd2EndMinEy {
    // Plug-in Metadata
    static get Name()     { return 'Minimise End-to-End Response Times (EY)'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginAutoSync.Category.Goal; }

    
    // Updates the task parameters to miminise end-to-end reponse times.
    static async Result(scheduler) {
        // Retrieve the LET system.
        const systemElementSelected = ['tasks', 'eventChains', 'constraints', 'schedule'];
        const system = await PluginAutoSync.DatabaseContentsGet(systemElementSelected);
        const tasks = await system[Model.TaskStoreName];
        const eventChains = await system[Model.EventChainStoreName];
        const constraints = await system[Model.ConstraintStoreName];
        const tasksInstances = await system[Model.TaskInstancesStoreName];
                
        // Create task dependency graph and assign task priorities for the heuristic.
        const graph = this.CreateTaskDependencyGraph(eventChains, constraints);
        if (graph == null) {
            return;
        }
                
        // Run iterative optimisation heuristic.
        this.Algorithm(tasks, eventChains, tasksInstances, graph.priorties);

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
        // taskDependencies: source --> target task dependency edges
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
        let graph = new PluginAutoSyncGoalEnd2EndMinEy.AdjacencyMatrix(tasksRequired);
        taskDependencies.forEach(dependency => graph.setDirectedEdge(dependency[0], dependency[1]));
        console.log(graph.toString());
        
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
        
        // Assign global task priorities.
        graph.computeGlobalTaskPriorties();
        
        return graph;
    }

    // Each parameter is a copy of a reference to an object.
    static Algorithm(tasks, eventChains, tasksInstances, taskPriorities) {
        
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
            this.priorities.set(node, new Map([['local', 0], ['global', 0]]));
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
    
    getSourceNode(index) {
        return this.getNode(this.sources, index);
    }
    
    getTargetIndex(node) {
        return this.targets.get(node);
    }
    
    getTargetNode(indexQuery) {
        return this.getNode(this.targets, index);
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
    
    getNodePriority(node, type) {
        return this.priorities.get(node).get(type);
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
    // based on the nodes' local priorities.
    computeGlobalTaskPriorties() {
        for (const startNode of this.startNodes) {
        
        }
    }
    
    toString() {
        const sources = Array.from(this.sources.entries()).map(entry => `${entry[0]}:${entry[1]}`);
        const targets = Array.from(this.targets.entries()).map(entry => `${entry[0]}:${entry[1]}`);
        return [`Sources: ${sources.join(', ')}`, `Targets: ${targets.join(', ')}`, this.matrix.join('\n')].join('\n');
    }
}

'use strict';

class PluginAutoSyncGoalEnd2EndMin {
    // Plug-in Metadata
    static get Name()     { return 'Minimise End-to-End Response Times'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Category() { return PluginAutoSync.Category.Goal; }

    
    // Updates the task parameters to miminise end-to-end reponse times.
    static async Result() {

        // Retrieve the LET system.
        const systemElementSelected = ['tasks', 'eventChains', 'schedule'];
        const system = await PluginAutoSync.DatabaseContentsGet(systemElementSelected);
        const tasks = await system[Model.TaskStoreName];
        const eventChains = await system[Model.EventChainStoreName];
        const taskInstances = await system[Model.TaskInstancesStoreName];
        
        this.Algorithm(tasks, eventChains, taskInstances);

        const taskElementSelected = ['tasks'];
        return PluginAutoSync.DatabaseContentsDelete(taskElementSelected)
            .then(PluginAutoSync.DatabaseContentsSet(system, taskElementSelected));
    }
    
    static getTask(name, tasks) {
        for (const task of tasks) {
            if (task.name == name) {
                return task;
            }
        }
    }
    
    static getTaskSetWcet(taskSet, tasks) {
        return [...taskSet]
            .filter(taskName => taskName != Model.SystemInterfaceName)
            .reduce((wcet, taskName) => wcet + this.getTask(taskName, tasks).wcet, 0);
    }

    // Each parameter is a copy of a reference to an object.
    static Algorithm(tasks, eventChains, taskInstances) {
        let inputTasks = new Set();
        let outputTasks = new Set();
        let eventChainTaskSets = new Set();
        
        // Get all the tasks involved in each event chain.
        for (const eventChain of eventChains) {
            let eventChainSuccessor = eventChain;
            
            // Record the task at the start of the chain.
            if (eventChainSuccessor.segment.source.task == Model.SystemInterfaceName) {
                inputTasks.add(eventChainSuccessor.segment.destination.task);
            }
            
            // Traverse the segments in the event chain and record the tasks.
            let taskSet = new Set();
            while (true) {
                taskSet.add(eventChainSuccessor.segment.source.task);
                taskSet.add(eventChainSuccessor.segment.destination.task);
                
                if (eventChainSuccessor.successor == undefined) {
                    break;
                }
                eventChainSuccessor = eventChainSuccessor.successor;
            }
            
            // Record the task at the end of the chain.
            if (eventChainSuccessor.segment.destination.task == Model.SystemInterfaceName) {
                outputTasks.add(eventChainSuccessor.segment.source.task);
            }

            eventChainTaskSets.add(taskSet);
        }

        // Get the maximum WCET of the event chain that each task participates in.
        let taskEventChainWcets = { };
        for (let task of tasks) {
            let maxEventChainWcet = 0;
            for (let eventChainTaskSet of eventChainTaskSets) {
                if (eventChainTaskSet.has(task.name)) {
                    const wcet = this.getTaskSetWcet(eventChainTaskSet, tasks);
                    maxEventChainWcet = Math.max(maxEventChainWcet, wcet);
                }
            }
            taskEventChainWcets[task.name] = maxEventChainWcet;
        }
        console.log(taskEventChainWcets);
        
        const sumOfAllTaskWcets = [...tasks].reduce((wcet, task) => wcet + task.wcet, 0);
        const totalUtlisation = [...tasks].reduce((utilisation, task) => utilisation + task.wcet/task.period, 0);

        let newLetParameters = { };
        for (const taskInstance of taskInstances) {
            const task = this.getTask(taskInstance.name, tasks);
            let activationOffset = task.period;
            let duration = 0;
            for (const instance of taskInstance.value) {
                // Get the min and max bounds of the task instance's execution intervals.
                let bound = { 'min': task.period, 'max': 0 };
                for (const executionInterval of instance.executionIntervals) {
                    bound.min = Math.min(bound.min, executionInterval.startTime - instance.periodStartTime);
                    bound.max = Math.max(bound.max, executionInterval.endTime - instance.periodStartTime);
                }

                // the end time must be the start time + some reserve
                //bound.max = sumOfAllTaskWcets;//bound.min + task.wcet; //+ taskEventChainWcets[task.name];
                
                // FIXME: Task's activationOffset should not be based on the minimum bound of its execution intervals.
                //        Should be the max LET end time of its predecessor task.
                if (outputTasks.has(task.name)) {
                    duration = task.wcet;
                } else {
                    // The task's activation offset is the min bound of the execution intervals.
                    activationOffset = Math.min(activationOffset, bound.min);    //what is the max start offset?

                    // The task's duration is equal to the sum of all task WCETs in the system.
                    duration = Math.max(duration, sumOfAllTaskWcets/*task.period*totalUtlisation*/); //what is the min duration?
                }

                console.log(task.name + " activationOffset: " + activationOffset + " duration: " + duration);
            }
            
            // FIXME: How can these conditions be true?
            if (activationOffset >= task.period) {
                activationOffset = 0;
            }
            if (duration == 0) {
                duration = task.period;
            }
            
            newLetParameters[taskInstance.name] = { 'activationOffset': activationOffset, 'duration': duration };
        }
        //console.log(newLetParameters);

        for (let task of tasks) {
            // Must update the contents of the referenced object.
            
            // FIXME: Why this condition?
            if (newLetParameters[task.name].activationOffset != 0) {
                task.activationOffset = newLetParameters[task.name].activationOffset;
            }
            
            task.duration = newLetParameters[task.name].duration;
        }
    }
    
}

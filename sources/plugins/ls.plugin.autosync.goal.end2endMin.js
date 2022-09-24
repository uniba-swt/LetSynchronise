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
        for (let task of tasks) {
            if (task.name == name) {
                return task;
            }
        }
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

        let taskChainWCET = { };
        let sumWCET = 0;
        for (let task of tasks) {
            let chainWCET = 0;
            for (let eventChainTaskSet of eventChainTaskSets) {
                if (eventChainTaskSet.has(task.name)) {
                    let WCETSum = 0;
                    for (let taskInChain of eventChainTaskSet) {
                        if (taskInChain != Model.SystemInterfaceName) {
                            WCETSum += this.getTask(taskInChain, tasks).wcet;
                        }
                    }
                    chainWCET = Math.max(chainWCET, WCETSum);
                }
            }
            sumWCET += task.wcet;
            taskChainWCET[task.name] = chainWCET;
        }
        console.log(taskChainWCET);

        let taskOffsets = {};
        let totalUtlisation = 0;
        for (let task of tasks) {
            totalUtlisation = totalUtlisation + task.wcet/task.period;
        }
        //console.log("total utlisation: "+ totalUtlisation);
        for (let taskInstance of taskInstances) {
            let task = this.getTask(taskInstance.name, tasks);
            let letStartOffset = task.period;
            let letDuration = 0;
            for (let instance of taskInstance.value) {
                let exeIntervalStart = task.period;
                let exeIntervalEnd = 0;

                //find the first start execution time and the last finsih execution time within a period
                for (let executionInterval of instance.executionIntervals) {
                    console.log("start internval: "+executionInterval.startTime+" "+task.name+ " "+instance.periodStartTime + " minus "+(executionInterval.startTime - instance.periodStartTime));
                    console.log(instance);
                    if (exeIntervalStart > executionInterval.startTime - instance.periodStartTime) {
                        exeIntervalStart = executionInterval.startTime - instance.periodStartTime; //for all instance start from 0
                        console.log("minus: "+exeIntervalStart + " - "+(executionInterval.startTime - instance.periodStartTime));
                    }
                    if (exeIntervalEnd < executionInterval.endTime - instance.periodStartTime) {
                        exeIntervalEnd = executionInterval.endTime - instance.periodStartTime; //for all instance start from 0
                    }
                }
                console.log("start interval " + exeIntervalStart);

                //if the offset is larger than the current offset and it is not a output task then delay LET start time
                if (letStartOffset > exeIntervalStart && (outputTasks.has(task.name)==false)) { //what is the min start offset?
                    letStartOffset = exeIntervalStart;
                }

                //the end time must be the start time + some reserve
                //exeIntervalEnd = sumWCET;//exeIntervalStart + task.wcet; //+ taskChainWCET[task.name];
                if (outputTasks.has(task.name)) {
                    letDuration = task.wcet;//exeIntervalEnd-exeIntervalStart;                 
                }else{
                    if (letDuration < sumWCET/*task.period*totalUtlisation*/) { //what is the min end offset?
                        letDuration = sumWCET/*task.period*totalUtlisation*/;//exeIntervalEnd-exeIntervalStart;
                    }
                }
                console.log(letDuration);

            }
            if (letStartOffset >= task.period) {
                letStartOffset = 0;
            }
            if (letDuration == 0) {
                letDuration = task.period;
            }
            taskOffsets[taskInstance.name] = {'letStartOffset':letStartOffset, 'letDuration': letDuration};
        }
        //console.log(taskOffsets);
        //console.log(tasks);
        for (let task of tasks) {
            // Must update the contents of the referenced object.
            //console.log(tasks);
            if (taskOffsets[task.name].letStartOffset != 0) {
                task.activationOffset = taskOffsets[task.name].letStartOffset;
            }
            
            task.duration = taskOffsets[task.name].letDuration;
   
            //console.log(task.duration);
            //task.duration = task.period;
        }
    }
    
}

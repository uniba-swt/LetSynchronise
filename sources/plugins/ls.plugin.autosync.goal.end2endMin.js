'use strict';

class PluginAutoSyncGoalEnd2EndMin {
    // Plug-in Metadata
    static get Name()     { return 'Miminise End-to-End Response Times'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Category() { return PluginAutoSync.Category.Goal; }

    
    // Updates the task parameters to miminise end-to-end reponse times.
    static async Result() {
        const taskElementSelected = ['tasks'];
        const taskSystem = await PluginAutoSync.DatabaseContentsGet(taskElementSelected);
        let tasks = taskSystem[Model.TaskStoreName];

        const eventChainElementSelected = ['eventChains'];
        const eventChainSystem = await PluginAutoSync.DatabaseContentsGet(eventChainElementSelected);
        let eventChains = eventChainSystem[Model.EventChainStoreName];

        const scheduleElementSelected = ['schedule'];
        const schedule = await PluginAutoSync.DatabaseContentsGet(scheduleElementSelected);
        
        this.Algorithm(tasks, eventChains, schedule);

        return PluginAutoSync.DatabaseContentsDelete(taskElementSelected)
            .then(PluginAutoSync.DatabaseContentsSet(taskSystem, taskElementSelected));
    }
    
    static getTask(name, tasks) {
        for (let task of tasks) {
            if (task.name == name) {
                return task;
            }
        }
    }

    // Parameter "tasks" is a copy of a reference to an object.
    static Algorithm(tasks, eventChains, schedule) {
        let inputTasks = new Set();
        let outputTasks = new Set();
        let eventChainTaskSets = new Set();
        for (let eventChain of eventChains) {
            //console.log("----event chain----")
            //console.log(eventChain)
            let firstTaskPort = eventChain.segment.source;
            let successor = eventChain.successor;
            let lastSuccessor = eventChain; //curently first == last
            let taskSet = new Set();
            taskSet.add(eventChain.segment.source.task);
            taskSet.add(eventChain.segment.destination.task);
            while(successor != undefined) {
                lastSuccessor = successor;
                successor = successor.successor;
                taskSet.add(lastSuccessor.segment.source.task);
                taskSet.add(lastSuccessor.segment.destination.task);
            }
            let lastTaskPort = lastSuccessor.segment.destination;
            if (firstTaskPort.task == "__system") {
                inputTasks.add(eventChain.segment.destination.task);
            }
            if (lastTaskPort.task == "__system") {
                outputTasks.add(lastSuccessor.segment.source.task);
            }
            //console.log(firstTaskPort)
            //console.log(lastTaskPort)
            eventChainTaskSets.add(taskSet);
        }
        //console.log(eventChainTaskSets)
        let taskChainWCET = { };
        let sumWCET = 0;
        for (let task of tasks) {
            let chainWCET = 0;
            for (let eventChainTaskSet of eventChainTaskSets) {
                if (eventChainTaskSet.has(task.name)) {
                    let WCETSum = 0;
                    for (let taskInChain of eventChainTaskSet) {
                        if (taskInChain != "__system") {
                            WCETSum += PluginAutoSyncGoalEnd2EndMin.getTask(taskInChain, tasks).wcet;
                        }
                    }
                    if (WCETSum > chainWCET) {
                        chainWCET = WCETSum;
                    }
                }
            }
            sumWCET += task.wcet;
            taskChainWCET[task.name] = chainWCET;
        }
        console.log(taskChainWCET);

        let taskInstances = schedule[Model.TaskInstancesStoreName];
        let taskOffsets = {};
        let totalUtlisation = 0;
        for (let task of tasks) {
            totalUtlisation = totalUtlisation + task.wcet/task.period;
        }
        //console.log("total utlisation: "+ totalUtlisation);
        for (let taskInstance of taskInstances) {
            let task = PluginAutoSyncGoalEnd2EndMin.getTask(taskInstance.name, tasks);
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
                console.log("start internval " +exeIntervalStart);

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

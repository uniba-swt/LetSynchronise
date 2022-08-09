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
        
        PluginAutoSyncGoalEnd2EndMin.Algorithm(tasks, eventChains, schedule);

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
        
        let taskInstances = schedule[Model.TaskInstancesStoreName];
        console.log(taskInstances)
        let taskOffsets = {};
        let totalUtlisation = 0;
        for (let task of tasks) {
            totalUtlisation = totalUtlisation + task.wcet/task.period;
        }
        console.log("total utlisation: "+ totalUtlisation);
        for (let taskInstance of taskInstances) {
            let task = PluginAutoSyncGoalEnd2EndMin.getTask(taskInstance.name, tasks);
            let letStartOffset = task.period;
            let letEndOffset = task.period;
            for (let instance of taskInstance.value) {
                let exeIntervalStart = instance.periodEndTime;
                let exeIntervalEnd = 0;
                for (let executionInterval of instance.executionIntervals) {
                    if (exeIntervalStart > executionInterval.startTime) {
                        exeIntervalStart = executionInterval.startTime;
                    }
                    if (exeIntervalEnd < executionInterval.endTime) {
                        exeIntervalEnd = executionInterval.endTime;
                    }
                }
                let periodStart = instance.periodStartTime;
                let periodEnd = instance.periodEndTime;
                console.log(exeIntervalStart+' '+exeIntervalEnd+' '+periodStart+' '+periodEnd);
                if (letStartOffset > exeIntervalStart-periodStart && task.name != "task_c") { //what is the min start offset?
                    letStartOffset = exeIntervalStart-periodStart;
                }
                if (task.name  != "task_c") {
                    if (exeIntervalEnd-exeIntervalStart >=  task.wcet) { //reserve worst case task.period * totalUtlisation
                        if (letEndOffset > periodEnd - exeIntervalEnd-letStartOffset) { //what is the min end offset?
                            letEndOffset = periodEnd - exeIntervalEnd-letStartOffset;
                        }
                    }else{
                        //exeIntervalEnd = exeIntervalStart+task.wcet*2; //heurstic? reserve 2xwcet as sometimes the scheduler cannot scheudle if 1xwcet
                        exeIntervalEnd = task.period * totalUtlisation;
                        if (letEndOffset > periodEnd - exeIntervalEnd) { //what is the min end offset?
                            letEndOffset = periodEnd - exeIntervalEnd;
                        }
                    }
                }
            }
            if (letStartOffset == task.period) {
                letStartOffset = 0;
            }
            if (letEndOffset == task.period) {
                letEndOffset = 0;
            }
            taskOffsets[taskInstance.name] = {'letStartOffset':letStartOffset, 'letEndOffset': letEndOffset};
        }
        console.log(taskOffsets);
        console.log(tasks);
        for (let task of tasks) {
            // Must update the contents of the referenced object.
            console.log(tasks);
            if (taskOffsets[task.name].letStartOffset != 0) {
                task.activationOffset = taskOffsets[task.name].letStartOffset;
            }
            if (taskOffsets[task.name].letEndOffset != 0) {
                task.duration = task.period - taskOffsets[task.name].letEndOffset;
            }
            console.log(task.duration);
            //task.duration = task.period;
        }
    }
    
}

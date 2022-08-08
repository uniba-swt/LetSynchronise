'use strict';

class PluginAutoSyncGoalEnd2EndMin {
    // Plug-in Metadata
    static get Name()     { return 'Miminise End-to-End Response Times'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Category() { return PluginAutoSync.Category.Goal; }

    
    // Updates the task parameters to miminise end-to-end reponse times.
    static async Result() {
        const taskElementSelected = ['tasks'];
        const system = await PluginAutoSync.DatabaseContentsGet(taskElementSelected);
        let tasks = system[Model.TaskStoreName];

        const scheduleElementSelected = ['schedule'];
        const schedule = await PluginAutoSync.DatabaseContentsGet(scheduleElementSelected);
        
        PluginAutoSyncGoalEnd2EndMin.Algorithm(tasks, schedule);

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

    // Parameter "tasks" is a copy of a reference to an object.
    static Algorithm(tasks, schedule) {
        
        let taskInstances = schedule[Model.TaskInstancesStoreName];
        console.log(taskInstances)
        let taskOffsets = {};
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
                if (letStartOffset > exeIntervalStart-periodStart) { //what is the min start offset?
                    letStartOffset = exeIntervalStart-periodStart;
                }
                if (exeIntervalEnd-exeIntervalStart >= task.wcet) { //reserve worst case
                    if (letEndOffset > periodEnd - exeIntervalEnd-letStartOffset) { //what is the min end offset?
                         letEndOffset = periodEnd - exeIntervalEnd-letStartOffset;
                    }
                }else{
                    exeIntervalEnd = exeIntervalStart+task.wcet*2; //heurstic? reserve 2xwcet as sometimes the scheduler cannot scheudle if 1xwcet
                    if (letEndOffset > periodEnd - exeIntervalEnd) { //what is the min end offset?
                        letEndOffset = periodEnd - exeIntervalEnd;
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
            task.activationOffset = taskOffsets[task.name].letStartOffset;
            task.duration = task.period - taskOffsets[task.name].letEndOffset;
            console.log(task.duration);
            //task.duration = task.period;
        }
    }
    
}

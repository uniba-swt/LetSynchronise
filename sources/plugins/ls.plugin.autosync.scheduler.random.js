'use strict';

class PluginAutoSyncSchedulerRandom {
    // Plug-in Metadata
    static get Name()     { return 'Randomise Task Scheduling'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginAutoSync.Category.Scheduler; }

    
    // Randomises the scheduling of task execution.
    static async Result(makespan, reinstantiateTasks) {
        // Create task instances and execution times.
        if (reinstantiateTasks) {
            await PluginAutoSync.DeleteSchedule();
            await PluginAutoSync.CreateAllTaskInstances(makespan);
        }
        await PluginAutoSync.CreateAllDependencyAndEventChainInstances(makespan);
        
        const scheduleElementSelected = ['schedule'];
        const schedule = await PluginAutoSync.DatabaseContentsGet(scheduleElementSelected);
        const tasks = await schedule[Model.TaskInstancesStoreName];

        PluginAutoSyncSchedulerRandom.Algorithm(tasks);
        
        return PluginAutoSync.DatabaseContentsDelete(scheduleElementSelected)
            .then(PluginAutoSync.DatabaseContentsSet(schedule, scheduleElementSelected));
    }
    
    static Algorithm(tasks) {
        // TODO: Track how far we are into the schedule.
        let currentTime = null;
        
        // For each task, keep track of the instance we are trying to schedule.
        let taskInstanceIndices = new Array(tasks.length);
        taskInstanceIndices.fill(0);
        
        // Schedule all the task instances in chronological order,
        // based on their activation time.
        // Task instances with the same activation time are selected at random.
        while (true) {
            let chosenTaskNumber = null;
            let chosenTaskInstance = null;
            for (const [taskNumber, task] of tasks.entries()) {
                if (taskInstanceIndices[taskNumber] == null) {
                    continue;
                }
                
                const taskInstance = task.value[taskInstanceIndices[taskNumber]];
                if (chosenTaskInstance == null || taskInstance.letStartTime < chosenTaskInstance.letStartTime) {
                    chosenTaskNumber = taskNumber;
                    chosenTaskInstance = taskInstance;
                }
            }
            currentTime = Math.max(currentTime, chosenTaskInstance.letStartTime);
            const nextTime = currentTime + chosenTaskInstance.executionTime;
            if (nextTime > chosenTaskInstance.letEndTime) {
                alert(`Could not schedule enough time for task ${tasks[chosenTaskNumber].name}, instance ${taskInstanceIndices[chosenTaskNumber]}!`);
                return;
            }
            const executionInterval = new Utility.Interval(currentTime, nextTime);
            chosenTaskInstance.executionIntervals.push(executionInterval);
            currentTime = nextTime;
            
            taskInstanceIndices[chosenTaskNumber]++;
            if (taskInstanceIndices[chosenTaskNumber] == tasks[chosenTaskNumber].value.length) {
                taskInstanceIndices[chosenTaskNumber] = null;
            }
            
            if (!taskInstanceIndices.some(element => element != null)) {
                break;
            }
        }
    }
    
}

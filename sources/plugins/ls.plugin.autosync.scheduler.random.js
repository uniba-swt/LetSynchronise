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
        // Track how far we are into the schedule.
        let currentTime = null;
        
        // For each task, keep track of the instance we are trying to schedule.
        // A null index means that all instances of a task have been scheduled.
        let taskInstanceIndices = new Array(tasks.length);
        taskInstanceIndices.fill(0);
        
        // Schedule all the task instances in chronological order, based on their LET start time.
        // Task instances with the same LET start time are selected arbitrarily.
        while (true) {
            let chosenTask = { 'number': null, 'instance': null };
            for (const [taskNumber, task] of tasks.entries()) {
                if (taskInstanceIndices[taskNumber] == null) {
                    continue;
                }
                
                // Choose the task instance with the minimum LET start time.
                const taskInstance = task.value[taskInstanceIndices[taskNumber]];
                if (chosenTask.instance == null || taskInstance.letStartTime < chosenTask.instance.letStartTime) {
                    chosenTask.number = taskNumber;
                    chosenTask.instance = taskInstance;
                }
            }
            
            // Make sure the current time is not earlier than the chosen task instance's LET start time.
            currentTime = Math.max(currentTime, chosenTask.instance.letStartTime);
            
            // Make sure the chosen task instance finishes its execution in its LET.
            const nextTime = currentTime + chosenTask.instance.executionTime;
            if (nextTime > chosenTask.instance.letEndTime) {
                alert(`Could not schedule enough time for task ${tasks[chosenTask.number].name}, instance ${taskInstanceIndices[chosenTask.number]}!`);
                return;
            }
            
            // Create the execution interval for the chosen task instance.
            const executionInterval = new Utility.Interval(currentTime, nextTime);
            chosenTask.instance.executionIntervals.push(executionInterval);
            
            // Advance the current time to the next time.
            currentTime = nextTime;
            
            // Consider the next instance of the chosen task in the next round of scheduling decisions.
            taskInstanceIndices[chosenTask.number]++;
            if (taskInstanceIndices[chosenTask.number] == tasks[chosenTask.number].value.length) {
                taskInstanceIndices[chosenTask.number] = null;
            }
            
            // Terminate when all task instances have been scheduled.
            if (!taskInstanceIndices.some(element => element != null)) {
                break;
            }
        }
    }
    
}

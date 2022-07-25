'use strict';

class PluginAutoSyncSchedulerRm {
    // Plug-in Metadata
    static get Name()     { return 'Rate-Monotonic Task Scheduling'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginAutoSync.Category.Scheduler; }

    
    // Uses a rate-monotonic algorithm to schedule task executions.
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

        PluginAutoSyncSchedulerRm.Algorithm(makespan, tasks);
        
        return PluginAutoSync.DatabaseContentsDelete(scheduleElementSelected)
            .then(PluginAutoSync.DatabaseContentsSet(schedule, scheduleElementSelected));
    }
    
    static Algorithm(makespan, tasks) {
        // Track how far we are into the schedule.
        let currentTime = 0;
        
        // For each task, keep track of the instance we are trying to schedule.
        // A null index means that all instances of a task have been scheduled.
        let taskInstanceIndices = new Array(tasks.length);
        taskInstanceIndices.fill(0);
        
        // Use a LIFO queue to track the preempted task instances.
        let preemptedTasksQueue = [];
        
        // Schedule all the task instances in chronological (LET start time) and
        // rate-monotonic (task period) order.
        // Task instances with the same priority and/or LET start time are selected arbitrarily.
        while (true) {
            // Track the earliest time that a task preemption may occur.
            let nextPreemptionTime = 2 * makespan;

            let chosenTask = { 'number': null, 'instance': null, 'period': null };
            for (const [taskNumber, task] of tasks.entries()) {
                if (taskInstanceIndices[taskNumber] == null) {
                    continue;
                }
                
                const taskInstance = task.value[taskInstanceIndices[taskNumber]];
                const taskInstancePeriod = taskInstance.periodEndTime - taskInstance.periodStartTime;
                
                // Update the chosenTask instance with taskInstance if any of the following three conditions are true:
                // 1. No task instance has been chosen, because we have only just started computing a new scheduling decision.
                const noChosenTask = (chosenTask.instance == null);
                // 2. Both the taskInstance and chosenTask are activated after the current time,
                //    but the taskInstance activates before the chosenTask.
                const earlierFutureActivation = !noChosenTask && (currentTime < taskInstance.letStartTime && taskInstance.letStartTime < chosenTask.instance.letStartTime);
                // 3. The priority of taskInstance is equal to or higher than the chosenTask and
                //    (the taskInstance has already been activated, or the taskInstance is not activated later than the chosenTask).
                const higherPriority = !noChosenTask && (taskInstancePeriod <= chosenTask.period && (taskInstance.letStartTime <= currentTime || taskInstance.letStartTime <= chosenTask.instance.letStartTime));
                
                if (noChosenTask || earlierFutureActivation || higherPriority) {
                    chosenTask.number = taskNumber;
                    chosenTask.instance = taskInstance;
                    chosenTask.period = taskInstancePeriod
                }
                
                // Find the latest time that the next scheduling decision has to be made.
                // Equal to the minimum LET start time of all higher-priority task instances.
                if (taskInstancePeriod < chosenTask.period) {
                    nextPreemptionTime = Math.min(nextPreemptionTime, taskInstance.letStartTime);
                }
            }
            
            let lastPreemptedTask = preemptedTasksQueue.pop();
            const noPreemptedTask = (lastPreemptedTask == null);
            
            // Resume the last preempted task instance if any of the following three conditions are true:
            // 1. No task instance could be chosen, because we have run out of new task instances to schedule.
            const noChosenTask = !noPreemptedTask && (chosenTask.number == null || chosenTask.instance == null);
            // 2. The priority of the last preempted task is equal to or higher than the chosenTask.
            const higherPriority = !noPreemptedTask && (lastPreemptedTask.period <= chosenTask.period);
            // 3. The chosenTask has not yet been activated for execution.
            const notActivated = !noPreemptedTask && (currentTime < chosenTask.instance.letStartTime);
            
            if (noChosenTask || higherPriority || notActivated) {
                if (!noChosenTask && notActivated) {
                    nextPreemptionTime = chosenTask.instance.letStartTime;
                }
                chosenTask = lastPreemptedTask;
            } else {
                if (lastPreemptedTask != null) {
                    // Push the last preempted task back onto the queue.
                    preemptedTasksQueue.push(lastPreemptedTask);
                }

                // Consider the next instance of the chosen task in the next round of scheduling decisions.
                taskInstanceIndices[chosenTask.number]++;
                if (taskInstanceIndices[chosenTask.number] == tasks[chosenTask.number].value.length) {
                    taskInstanceIndices[chosenTask.number] = null;
                }
            }
            
            // Make sure the current time is not earlier than the chosenTask's LET start time.
            currentTime = Math.max(currentTime, chosenTask.instance.letStartTime);
            
            // Schedule as much of the chosen task instance's execution time before the next preeemption time.
            // Create an execution interval for the chosen task instance.
            const executionTimeEnd = currentTime + PluginAutoSyncSchedulerRm.RemainingExecutionTime(chosenTask.instance);
            if (executionTimeEnd > chosenTask.instance.letEndTime) {
                alert(`Could not schedule enough time for task ${tasks[chosenTask.number].name}, instance ${chosenTask.instance.instance}!`);
                return;
            }
            if (executionTimeEnd <= nextPreemptionTime) {
                const executionInterval = new Utility.Interval(currentTime, executionTimeEnd);
                chosenTask.instance.executionIntervals.push(executionInterval);
            } else {
                const executionInterval = new Utility.Interval(currentTime, nextPreemptionTime);
                chosenTask.instance.executionIntervals.push(executionInterval);
                preemptedTasksQueue.push(chosenTask);
            }
            
            // Advance the current time to after the task has finished executing or the next task preemption, whichever occurs earlier.
            currentTime = Math.min(executionTimeEnd, nextPreemptionTime);
            
            // Terminate when all task instances have been scheduled.
            if (!taskInstanceIndices.some(element => element != null) && preemptedTasksQueue.length == 0
                || currentTime == makespan) {
                break;
            }
        }
    }
    
    static RemainingExecutionTime(taskInstance) {
        const executionIntervals = taskInstance.executionIntervals.map(json => Utility.Interval.FromJson(json));
        const executedTime = executionIntervals.reduce((prev, curr) => prev + curr.duration, 0);
        return taskInstance.executionTime - executedTime;
    }
    
}

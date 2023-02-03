'use strict';

class PluginSchedulerFp {
    // Plug-in Metadata
    static get Name()     { return 'Fixed-Priority Task Scheduling'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Type()     { return Plugin.Type.Scheduler; }
    static get Category() { return Plugin.Category.Preemptive; }

    
    // Uses a fixed-priority algorithm to schedule task executions.
    static async Result(makespan, executionTiming) {
        // Create instances of tasks, execution times, data dependencies, and event chains.
        await Plugin.DeleteSchedule();
        await Plugin.CreateAllTaskInstances(makespan, executionTiming);
        await Plugin.CreateAllDependencyAndEventChainInstances(makespan);
        
        const systemElementSelected = ['schedule', 'tasks'];
        const system = await Plugin.DatabaseContentsGet(systemElementSelected);
        const tasksInstances = await system[Model.TaskInstancesStoreName];
        const tasksParameters = await system[Model.TaskStoreName];

        const result = this.Algorithm(tasksInstances, makespan, tasksParameters);
        if (!result.schedulable) {
            alert(result.message);
            return;
        }
        
        return Plugin.DatabaseContentsDelete(systemElementSelected)
            .then(Plugin.DatabaseContentsSet(system, systemElementSelected));
    }
    
    // Preemptive fixed-priority.
    static Algorithm(tasksInstances, makespan, tasksParameters) {
        // Do nothing if the task set is empty.
        if (tasksInstances.length == 0) {
            return { 'schedulable': true, 'message': 'No tasks to schedule' };
        }

        // Track how far we are into the schedule.
        let currentTime = 0;
        
        // For each task, keep track of the instance we are trying to schedule.
        // A null index means that all instances of a task have been scheduled.
        let taskInstanceIndices = new Array(tasksInstances.length);
        taskInstanceIndices.fill(0);
        
        // Use a LIFO queue to track the preempted task instances.
        let preemptedTasksQueue = [];
        
        // Schedule all the task instances in chronological (LET start time) and
        // fixed-priority order.
        // Task instances with the same priority and/or LET start time are selected arbitrarily.
        while (true) {
            // Track the earliest time that a task preemption may occur.
            let nextPreemptionTime = 2 * makespan;

            let chosenTask = { 'number': null, 'instance': null, 'priority': null };
            for (const [taskNumber, task] of tasksInstances.entries()) {
                if (taskInstanceIndices[taskNumber] == null) {
                    continue;
                }
                
                const taskParameters = tasksParameters.filter(taskParameters => taskParameters.name == task.name)[0];
                const taskPriority = (taskParameters.priority == null) ? 0 : taskParameters.priority;
                const taskInstance = task.value[taskInstanceIndices[taskNumber]];
                
                // Pre-compute some of the task scheduling conditions:
                // * No task instance has been chosen, because we have only just started computing a new scheduling decision.
                const noChosenTask = (chosenTask.number == null || chosenTask.instance == null);
                // * Only this taskInstance has been activated.
                const onlyTaskActivated = !noChosenTask && (taskInstance.letStartTime <= currentTime) && (currentTime < chosenTask.instance.letStartTime);
                // * Both the taskInstance and chosenTask have been activated.
                const bothTasksActivated = !noChosenTask && (taskInstance.letStartTime <= currentTime && chosenTask.instance.letStartTime <= currentTime);
                // * Both the taskInstance and chosenTask have not been activated.
                const bothTasksNotActivated = !noChosenTask && (taskInstance.letStartTime > currentTime && chosenTask.instance.letStartTime > currentTime);
                // * Both the taskInstance and chosenTask are activated after the current time,
                //   but the taskInstance activates before the chosenTask.
                const earlierFutureActivation = !noChosenTask && (currentTime < taskInstance.letStartTime && taskInstance.letStartTime < chosenTask.instance.letStartTime);
                // * Both the taskInstance and chosenTask are activated at the same time.
                const sameActivationTime = !noChosenTask && (taskInstance.letStartTime == chosenTask.instance.letStartTime);
                // * The priority of taskInstance is equal to or higher than the chosenTask, 
                //   and both task instances have been activated or both will activate at the same time.
                const higherPriority = ((bothTasksActivated || bothTasksNotActivated && sameActivationTime) && (taskPriority >= chosenTask.priority));
                
                // Update the chosenTask instance with taskInstance if any of the following 4 conditions are true:
                // 1. No task instance has been chosen.
                // 2. Only the taskInstance has been activated.
                // 3. Both the taskInstance and chosenTask will be activated in the future, but taskInstance activates earlier.
                // 4. Both the taskInstance and chosenTask have been activated or will be activated together, but taskInstance has the same or higher priority.
                const previousChosenTask = { ...chosenTask};    // Make a deep copy.
                if (noChosenTask || onlyTaskActivated || earlierFutureActivation || higherPriority) {
                    chosenTask.number = taskNumber;
                    chosenTask.instance = taskInstance;
                    chosenTask.priority = taskPriority;
                }
                
                // Find the latest time that the next scheduling decision has to be made.
                // Equal to the minimum LET start time of all higher-priority task instances.
                const noPreviousChosenTask = (previousChosenTask.number == null || previousChosenTask.instance == null);
                if (!noPreviousChosenTask && previousChosenTask.priority > chosenTask.priority) {
                    nextPreemptionTime = Math.min(nextPreemptionTime, previousChosenTask.instance.letStartTime);
                }
                if (taskPriority > chosenTask.priority) {
                    nextPreemptionTime = Math.min(nextPreemptionTime, taskInstance.letStartTime);
                }
            }
            
            let lastPreemptedTask = preemptedTasksQueue.pop();
            const noPreemptedTask = (lastPreemptedTask == null);
            
            // Pre-compute some of the task scheduling conditions:
            // * No task instance could be chosen, because we have run out of new task instances to schedule.
            const noChosenTask = (chosenTask.number == null || chosenTask.instance == null);
            // * The priority of the last preempted task is equal to or higher than the chosenTask.
            const higherPriority = !noChosenTask && !noPreemptedTask && (lastPreemptedTask.priority >= chosenTask.priority);
            // * The chosenTask has not yet been activated for execution.
            const notActivated = !noChosenTask && !noPreemptedTask && (currentTime < chosenTask.instance.letStartTime);
            
            // Resume the last preempted task instance if any of the following 3 conditions are true:
            // 1. No task instance has been chosen, but there is a preempted task instance.
            // 2. Preempted task instance has the same or higher priority than the chosen task instance.
            // 3. Chosen task instance has not been acitvated for execution.
            if (!noPreemptedTask && noChosenTask || higherPriority || notActivated) {
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
                if (taskInstanceIndices[chosenTask.number] == tasksInstances[chosenTask.number].value.length) {
                    taskInstanceIndices[chosenTask.number] = null;
                }
            }
            
            // Make sure the current time is not earlier than the chosenTask's LET start time.
            currentTime = Math.max(currentTime, chosenTask.instance.letStartTime);
            
            // Schedule as much of the chosen task instance's execution time before the next preeemption time.
            // Create an execution interval for the chosen task instance.
            const executionTimeEnd = currentTime + this.RemainingExecutionTime(chosenTask.instance);
            if (executionTimeEnd > chosenTask.instance.letEndTime) {
                const message = `Could not schedule enough time for task ${tasksInstances[chosenTask.number].name}, instance ${chosenTask.instance.instance}!`;
                return { 'schedulable': false, 'message': message };
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

        return { 'schedulable': true, 'message': 'Scheduling finished' };
    }
    
    static RemainingExecutionTime(taskInstance) {
        const executionIntervals = taskInstance.executionIntervals.map(json => Utility.Interval.FromJson(json));
        const executedTime = executionIntervals.reduce((prev, curr) => prev + curr.duration, 0);
        return taskInstance.executionTime - executedTime;
    }
    
}

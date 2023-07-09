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

        const coreElementSelected = ['cores'];
        const cores = (await Plugin.DatabaseContentsGet(coreElementSelected))[Model.CoreStoreName];

        const result = this.Algorithm(tasksInstances, makespan, tasksParameters, cores);
        if (!result.schedulable) {
            alert(result.message);
            return;
        }
        
        return Plugin.DatabaseContentsDelete(systemElementSelected)
            .then(Plugin.DatabaseContentsSet(system, systemElementSelected));
    }
    
    // Preemptive fixed-priority, multicore, no task migration.
    static Algorithm(tasksInstances, makespan, tasksParameters, cores) {
        // Do nothing if the task set is empty.
        if (tasksInstances.length == 0) {
            return { 'schedulable': true, 'message': 'No tasks to schedule' };
        }

        // Assume a single core (default) platform when the system has not defined any cores.
        if (cores.length == 0) {
            cores = [ModelCore.Default];
        }

        // Track how far we are into the schedule on each core.
        // Track the preempted task instances in a LIFO queue for each core.
        let coreCurrentTime = { };
        let corePreemptedTasksQueue = { };
        for (const core of cores) {
            coreCurrentTime[core.name] = 0;
            corePreemptedTasksQueue[core.name] = [ ];
        }
        
        // For each task, keep track of the instance we are trying to schedule.
        // A null index means that all instances of a task have been scheduled.
        let taskInstanceIndices = new Array(tasksInstances.length).fill(0);
        
        // For all task instances, set their remaining execution times.
        tasksInstances.forEach(taskInstances =>
            taskInstances.value.forEach(instance => instance.remainingExecutionTime = instance.executionTime)
        );
                
        // Schedule all the task instances in chronological (LET start time) and
        // fixed-priority order.
        // Task instances with the same priority and/or LET start time are selected arbitrarily.
        while (true) {
            // Track the earliest time that a task preemption may occur on each core.
            let coreNextPreemptionTime = { };
            let coreChosenTask = { };
            for (const core of cores) {
                coreNextPreemptionTime[core.name] = 2 * makespan;
                coreChosenTask[core.name] = { 'number': null, 'instance': null, 'priority': null };
            }

            for (const [taskNumber, task] of tasksInstances.entries()) {
                if (taskInstanceIndices[taskNumber] == null) {
                    continue;
                }
                
                const taskParameters = tasksParameters.find(({ name }) => name == task.name);
                const taskPriority = (taskParameters.priority == null) ? 0 : taskParameters.priority;
                const taskInstance = task.value[taskInstanceIndices[taskNumber]];
                
                // Use the core defined by the design, otherwise, select an available core.
                let availableCore = taskInstance.currentCore;
                if (availableCore == null) {
                    for (const core of cores) {
                        if (availableCore == null || coreCurrentTime[core.name] < coreCurrentTime[availableCore]) {
                            availableCore = core.name;
                        }
                    }
                }
                const taskCore = cores.find(({ name }) => name == availableCore);
                
                // Pre-compute some of the task scheduling conditions:
                // * No task instance has been chosen, because we have only just started computing a new scheduling decision.
                const noChosenTask = (coreChosenTask[taskCore.name].number == null || coreChosenTask[taskCore.name].instance == null);
                // * Only this taskInstance has been activated.
                const onlyTaskActivated = !noChosenTask && (taskInstance.letStartTime <= coreCurrentTime[taskCore.name]) && (coreCurrentTime[taskCore.name] < coreChosenTask[taskCore.name].instance.letStartTime);
                // * Both the taskInstance and chosenTask have been activated.
                const bothTasksActivated = !noChosenTask && (taskInstance.letStartTime <= coreCurrentTime[taskCore.name] && coreChosenTask[taskCore.name].instance.letStartTime <= coreCurrentTime[taskCore.name]);
                // * Both the taskInstance and chosenTask have not been activated.
                const bothTasksNotActivated = !noChosenTask && (taskInstance.letStartTime > coreCurrentTime[taskCore.name] && coreChosenTask[taskCore.name].instance.letStartTime > coreCurrentTime[taskCore.name]);
                // * Both the taskInstance and chosenTask are activated after the current time,
                //   but the taskInstance activates before the chosenTask.
                const earlierFutureActivation = !noChosenTask && (coreCurrentTime[taskCore.name] < taskInstance.letStartTime && taskInstance.letStartTime < coreChosenTask[taskCore.name].instance.letStartTime);
                // * Both the taskInstance and chosenTask are activated at the same time.
                const sameActivationTime = !noChosenTask && (taskInstance.letStartTime == coreChosenTask[taskCore.name].instance.letStartTime);
                // * The priority of taskInstance is equal to or higher than the chosenTask, 
                //   and both task instances have been activated or both will activate at the same time.
                const higherPriority = ((bothTasksActivated || bothTasksNotActivated && sameActivationTime) && (taskPriority >= coreChosenTask[taskCore.name].priority));
                
                // Update the chosenTask instance with taskInstance if any of the following 4 conditions are true:
                // 1. No task instance has been chosen.
                // 2. Only the taskInstance has been activated.
                // 3. Both the taskInstance and chosenTask will be activated in the future, but taskInstance activates earlier.
                // 4. Both the taskInstance and chosenTask have been activated or will be activated together, but taskInstance has the same or higher priority.
                const previousChosenTask = { ...coreChosenTask[taskCore.name]};    // Make a deep copy.
                if (noChosenTask || onlyTaskActivated || earlierFutureActivation || higherPriority) {
                    coreChosenTask[taskCore.name].number = taskNumber;
                    coreChosenTask[taskCore.name].instance = taskInstance;
                    coreChosenTask[taskCore.name].priority = taskPriority;
                    coreChosenTask[taskCore.name].core = taskCore;
                }
                
                // Find the latest time that the next scheduling decision has to be made.
                // Equal to the minimum LET start time of all higher-priority task instances.
                const noPreviousChosenTask = (previousChosenTask.number == null || previousChosenTask.instance == null);
                if (!noPreviousChosenTask && previousChosenTask.priority > coreChosenTask[taskCore.name].priority) {
                    coreNextPreemptionTime[taskCore.name] = Math.min(coreNextPreemptionTime[taskCore.name], previousChosenTask.instance.letStartTime);
                }
                if (taskPriority > coreChosenTask[taskCore.name].priority) {
                    coreNextPreemptionTime[taskCore.name] = Math.min(coreNextPreemptionTime[taskCore.name], taskInstance.letStartTime);
                }
            }
            
            // Advance the chosen task instances on each core.
            for (const core of cores) {
                let lastPreemptedTask = corePreemptedTasksQueue[core.name].pop();
                const noPreemptedTask = (lastPreemptedTask == null);
                
                // Pre-compute some of the task scheduling conditions:
                // * No task instance could be chosen, because we have run out of new task instances to schedule.
                const noChosenTask = (coreChosenTask[core.name].number == null || coreChosenTask[core.name].instance == null);
                // * The priority of the last preempted task is equal to or higher than the chosenTask.
                const higherPriority = !noChosenTask && !noPreemptedTask && (lastPreemptedTask.priority >= coreChosenTask[core.name].priority);
                // * The chosenTask has not yet been activated for execution.
                const notActivated = !noChosenTask && !noPreemptedTask && (coreCurrentTime[core.name] < coreChosenTask[core.name].instance.letStartTime);
                
                // Resume the last preempted task instance if any of the following 3 conditions are true:
                // 1. No task instance has been chosen, but there is a preempted task instance.
                // 2. Preempted task instance has the same or higher priority than the chosen task instance.
                // 3. Chosen task instance has not been acitvated for execution.
                if (!noPreemptedTask && noChosenTask || higherPriority || notActivated) {
                    if (!noChosenTask && notActivated) {
                        coreNextPreemptionTime[core.name] = coreChosenTask[core.name].instance.letStartTime;
                    }
                    coreChosenTask[core.name] = lastPreemptedTask;
                } else {
                    if (!noPreemptedTask) {
                        // Push the last preempted task back onto the queue.
                        corePreemptedTasksQueue[core.name].push(lastPreemptedTask);
                    }
                    
                    if (noChosenTask) {
                        // No task to execute on this core.
                        continue;
                    }

                    // Consider the next instance of the chosen task in the next round of scheduling decisions.
                    taskInstanceIndices[coreChosenTask[core.name].number]++;
                    if (taskInstanceIndices[coreChosenTask[core.name].number] == tasksInstances[coreChosenTask[core.name].number].value.length) {
                        taskInstanceIndices[coreChosenTask[core.name].number] = null;
                    }
                }
                
                // Make sure the current time is not earlier than the chosenTask's LET start time.
                coreChosenTask[core.name].instance.currentCore = core;
                coreCurrentTime[core.name] = Math.max(coreCurrentTime[core.name], coreChosenTask[core.name].instance.letStartTime);
                
                // Schedule as much of the chosen task instance's execution time before the next preeemption time.
                // Create an execution interval for the chosen task instance.
                const executionTimeEnd = coreCurrentTime[core.name] + this.ExecutionTimeOnCore(coreChosenTask[core.name].instance);
                if (executionTimeEnd > coreChosenTask[core.name].instance.letEndTime) {
                    const message = `Could not schedule enough time for task ${tasksInstances[coreChosenTask[core.name].number].name}, instance ${coreChosenTask[core.name].instance.instance} on core ${core.name}!`;
                    return { 'schedulable': false, 'message': message };
                }
                if (executionTimeEnd <= coreNextPreemptionTime[core.name]) {
                    const executionInterval = new Utility.Interval(coreCurrentTime[core.name], executionTimeEnd, core.name);
                    coreChosenTask[core.name].instance.executionIntervals.push(executionInterval);
                    coreChosenTask[core.name].instance.remainingExecutionTime = 0;
                } else {
                    const executionInterval = new Utility.Interval(coreCurrentTime[core.name], coreNextPreemptionTime[core.name], core.name);
                    coreChosenTask[core.name].instance.executionIntervals.push(executionInterval);
                    coreChosenTask[core.name].instance.remainingExecutionTime -= executionInterval.duration * core.speedup;
                    corePreemptedTasksQueue[core.name].push(coreChosenTask[core.name]);
                }
                
                // Advance the current time to after the task has finished executing or the next task preemption, whichever occurs earlier.
                coreCurrentTime[core.name] = Math.min(executionTimeEnd, coreNextPreemptionTime[core.name]);
            }
            
            // Terminate when all task instances have been scheduled.
            const emptyTaskQueues = Object.values(corePreemptedTasksQueue).reduce((prev, next) => prev && next.length == 0, true);
            const reachedMakespan = Object.values(coreCurrentTime).reduce((prev, next) => prev && next == makespan, true);
            if (!taskInstanceIndices.some(element => element != null) && emptyTaskQueues
                || reachedMakespan) {
                break;
            }
        }

        return { 'schedulable': true, 'message': 'Scheduling finished' };
    }
    
    static ExecutionTimeOnCore(taskinstance) {
        return taskinstance.remainingExecutionTime / taskinstance.currentCore.speedup;
    }
    
}

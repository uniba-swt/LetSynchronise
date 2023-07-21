'use strict';

class PluginSchedulerRandom {
    // Plug-in Metadata
    static get Name()     { return 'Random Task Scheduling'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Type()     { return Plugin.Type.Scheduler; }
    static get Platform() { return Plugin.Platform.MultiCore; }
    static get Category() { return Plugin.Category.NonPreemptive; }

    
    // Random non-preemptive scheduling of task execution.
    static async Result(makespan, executionTiming) {
        // Create instances of tasks, execution times, data dependencies, and event chains.
        await Plugin.DeleteSchedule();
        await Plugin.CreateAllTaskInstances(makespan, executionTiming);
        await Plugin.CreateAllDependencyAndEventChainInstances(makespan);
        
        const scheduleElementSelected = ['schedule'];
        const schedule = await Plugin.DatabaseContentsGet(scheduleElementSelected);
        const tasks = await schedule[Model.TaskInstancesStoreName];
        
        const coreElementSelected = ['cores'];
        const cores = (await Plugin.DatabaseContentsGet(coreElementSelected))[Model.CoreStoreName];

        const result = this.Algorithm(cores, tasks);
        if (!result.schedulable) {
            alert(result.message);
            return;
        }
        
        return Plugin.DatabaseContentsDelete(scheduleElementSelected)
            .then(Plugin.DatabaseContentsSet(schedule, scheduleElementSelected));
    }
    
    // Non-preemptive random, multicore, no task migration.
    static Algorithm(cores, tasks) {
        // Do nothing if the task set is empty.
        if (tasks.length == 0) {
            return { 'schedulable': true, 'message': 'No tasks to schedule' };
        }
        
        // Assume a single core (default) platform when the system has not defined any cores.
        if (cores.length == 0) {
            cores = [ModelCore.Default];
        }

        // Track how far we are into the schedule on each core.
        let coreCurrentTime = { };
        for (const core of cores) {
            coreCurrentTime[core.name] = 0;
        }
        
        // For each task, keep track of the instance we are trying to schedule.
        // A null index means that all instances of a task have been scheduled.
        let taskInstanceIndices = new Array(tasks.length).fill(0);
        
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
            
            // Select a random core. Before execution, chosenTask.instance.currentCore stores the
            // core decided by the designer. During execution, chosenTask.instance.currentCore stores the last
            // core decided by the scheduler, e.g., to support task migration.
            chosenTask.instance.currentCore = cores[Math.floor(Math.random() * cores.length)];
            
            // Make sure the current time is not earlier than the chosen task instance's LET start time.
            coreCurrentTime[chosenTask.instance.currentCore.name] = Math.max(coreCurrentTime[chosenTask.instance.currentCore.name], chosenTask.instance.letStartTime);
            
            // Make sure the chosen task instance finishes its execution in its LET.
            const nextTime = coreCurrentTime[chosenTask.instance.currentCore.name] + this.ExecutionTimeOnCore(chosenTask.instance);
            if (nextTime > chosenTask.instance.letEndTime) {
                const message = `Could not schedule enough time for task ${tasks[chosenTask.number].name}, instance ${chosenTask.instance.instance} on core ${chosenTask.instance.currentCore.name}!`;
                return { 'schedulable': false, 'message': message };
            }
            
            // Create the execution interval for the chosen task instance.
            const executionInterval = new Utility.Interval(coreCurrentTime[chosenTask.instance.currentCore.name], nextTime, chosenTask.instance.currentCore.name);
            chosenTask.instance.executionIntervals.push(executionInterval);
            
            // Advance the current time to the next time.
            coreCurrentTime[chosenTask.instance.currentCore.name] = nextTime;
            
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

        return { 'schedulable': true, 'message': 'Scheduling finished' };
    }
    
    static ExecutionTimeOnCore(taskinstance) {
        return taskinstance.executionTime / taskinstance.currentCore.speedup;
    }
    
}

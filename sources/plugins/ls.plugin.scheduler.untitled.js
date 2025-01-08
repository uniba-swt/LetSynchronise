'use strict';

class PluginSchedulerUntitled {
    // Plug-in Metadata
    static get Name()     { return 'Untitled Task Scheduling'; }
    static get Author()   { return 'Jamie Lee'; }
    static get Type()     { return Plugin.Type.Scheduler; }
    static get Platform() { return Plugin.Platform.MultiCore; }
    static get Category() { return Plugin.Category.NonPreemptive; }

    
    // Uses an earliest deadline first algorithm to schedule task executions.
    static async Result(makespan, executionTiming) {
        // Create task instances, execution times, data dependencies, and event chains.
        await Plugin.DeleteSchedule();
        await Plugin.CreateAllTaskInstances(makespan, executionTiming);
        await Plugin.CreateAllDependencyAndEventChainInstances(makespan);
        
        const scheduleElementSelected = ['schedule', 'devices'];
        const schedule = await Plugin.DatabaseContentsGet(scheduleElementSelected);
        const tasksInstances = (await schedule[Model.EntityInstancesStoreName]).filter(entity => entity.type === 'task');

        const coreElementSelected = ['cores'];
        const cores = (await Plugin.DatabaseContentsGet(coreElementSelected))[Model.CoreStoreName];

        const result = this.Algorithm(cores, tasksInstances, makespan);
        if (!result.schedulable) {
            alert(result.message);
        }
        
        // return Plugin.DatabaseContentsDelete(scheduleElementSelected)
        //     .then(Plugin.DatabaseContentsSet(schedule, scheduleElementSelected));
    }
    
    // Preemptive, earliest deadline first, multicore, no task migration.
    // Preempts the core that will idle the earliest.
    static Algorithm(cores, tasksInstances, makespan) {
        // Do nothing if the task set is empty.
        if (tasksInstances.length == 0) {
            return { 'schedulable': true, 'message': 'No tasks to schedule' };
        }

        // Assume a single core (default) platform when the system has not defined any cores.
        if (cores.length == 0) {
            cores = [ModelCore.Default];
        }

        /*
         * 1. Check if the system has defined cores (the above if statement will need to be modified)
         * 2. If not, return a message to advise the user to define cores. (later)
         * 3. If there are more than 1 task but only 1 core is defined, return an error message? Or use default core? (later)
         * 
         * Scenario: 2 cores and 3 tasks. C1 = D1, C2 = D2
         * 1. Check for dependencies and event chains
         * 2. Schedule accordingly ig lol
         */

        console.log(cores)

        // Track how far we are into the schedule on each core.
        // Track the preempted task instances in a deadline-sorted queue for each core.
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
        tasksInstances.forEach(taskInstances => {
            taskInstances.value.forEach(instance => instance.remainingExecutionTime = instance.executionTime)
        });
        
        // Schedule all the task instances in chronological (LET start time) and
        // earliest deadline order.
        // Task instances with the same priority and/or LET start time are selected arbitrarily.
        // while (true) {
        //     // Track the earliest time that a task preemption may occur on each core.
        //     let coreNextPreemptionTime = { };
        //     let coreChosenTask = { };
        //     for (const core of cores) {
        //         coreNextPreemptionTime[core.name] = 2 * makespan;
        //         coreChosenTask[core.name] = { 'number': null, 'instance': null, 'deadline': null };
        //     }


        // }
        
        return { 'schedulable': true, 'message': 'Scheduling finished' };
    }

    
}

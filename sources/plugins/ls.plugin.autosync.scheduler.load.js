'use strict';

class PluginAutoSyncSchedulerLoad {
    // Plug-in Metadata
    static get Name()     { return 'Load'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Category() { return PluginAutoSync.Category.Scheduler; }

    
    // Does nothing 
    static async Result(makespan, reinstantiateTasks) {
        // Create task instances and execution times.
        /*if (reinstantiateTasks) {
            await PluginAutoSync.DeleteSchedule();
            await PluginAutoSync.CreateAllTaskInstances(makespan);
        }
        await PluginAutoSync.CreateAllDependencyAndEventChainInstances(makespan);*/
        
        const scheduleElementSelected = ['schedule'];
        const schedule = await PluginAutoSync.DatabaseContentsGet(scheduleElementSelected);    
        return PluginAutoSync.DatabaseContentsDelete(scheduleElementSelected)
            .then(PluginAutoSync.DatabaseContentsSet(schedule, scheduleElementSelected));
    }
    
    // Non-preemptive random.
    static Algorithm(tasks) {

    }

    /*
    DatabaseContentsGet element map
        const elementMap = {
            'constraints'  : Model.ConstraintStoreName,
            'dependencies' : Model.DependencyStoreName,
            'eventChains'  : Model.EventChainStoreName,
            'inputs'       : Model.SystemInputStoreName,
            'outputs'      : Model.SystemOutputStoreName,
            'tasks'        : Model.TaskStoreName,
            'schedule'     : [
                                Model.ConstraintInstancesStoreName,
                                Model.DependencyInstancesStoreName,
                                Model.EventChainInstanceStoreName,
                                Model.TaskInstancesStoreName
                             ]
        };
        

    */
    
}

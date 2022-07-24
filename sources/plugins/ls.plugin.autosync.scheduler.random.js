'use strict';

class PluginAutoSyncSchedulerRandom {
    // Plug-in Metadata
    static get Name()     { return 'Randomise Task Scheduling'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginAutoSync.Category.Scheduler; }

    
    // Randomises the scheduling of task execution.
    static async Result(makespan) {
        // TODO: Create task instances and execution times.
        await PluginAutoSync.DeleteSchedule();
        await PluginAutoSync.CreateAllTaskInstances(makespan);
        await PluginAutoSync.ModelDatabase.CreateAllDependencyAndEventChainInstances(makespan);
        
        PluginAutoSyncSchedulerRandom.Algorithm();
        
        return null;
    }
    
    static Algorithm() {
        // TODO: Create execution intervals.
    
    }
    
}

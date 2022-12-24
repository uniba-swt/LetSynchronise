'use strict';

class PluginAutoSyncSchedulerIdentity {
    // Plug-in Metadata
    static get Name()     { return 'No Scheduling (Identity)'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginAutoSync.Category.Scheduler; }

    
    // Simply return nothing.
    static async Result(makespan, executionTiming) {
        return;
    }
    
    // Simply do nothing.
    static Algorithm(taskInstances, makespan) {
        return { 'schedulable': true, 'message': 'Scheduling finished' };
    }

}

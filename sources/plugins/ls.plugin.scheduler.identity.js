'use strict';

class PluginSchedulerIdentity {
    // Plug-in Metadata
    static get Name()     { return 'No Scheduling (Identity)'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Type()     { return Plugin.Type.Scheduler; }
    static get Category() { return Plugin.Category.Identity; }

    
    // Simply return nothing.
    static async Result(makespan, executionTiming) {
        return;
    }

}

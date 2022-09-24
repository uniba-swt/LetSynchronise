'use strict';

class PluginAutoSyncSchedulerTuDortmund {
    // Plug-in Metadata
    static get Name()     { return 'TU Dortmund'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Category() { return PluginAutoSync.Category.Scheduler; }

    
    // Uses an external web tool to schedule the task executions
    static async Result(makespan, executionTiming) {
        // Delete existing schedule
        await PluginAutoSync.DeleteSchedule();
        
        // Retrieve the LET system
        const systemElementSelected = ['inputs','outputs','tasks','dependencies','eventChains','constraints'];
        const system = await PluginAutoSync.DatabaseContentsGet(systemElementSelected);
        
        // Schedule the LET system with an external web tool
        const computedSchedule = await this.Algorithm(system, executionTiming);
        if (computedSchedule == null) {
            alert('Plugin does not support LET tasks with non-zero initial offsets');
            return
        }
        
        // Save the externally computed task schedule and compute the dependency and event chain instances
        const scheduleElementSelected = ['schedule'];
        return PluginAutoSync.DatabaseContentsDelete(scheduleElementSelected)
            .then(result => PluginAutoSync.DatabaseContentsSet(computedSchedule, scheduleElementSelected))
            .then(result => PluginAutoSync.CreateAllDependencyAndEventChainInstances(makespan));
    }

    // Trigger an external scheduling tool
    // TODO: Make use of executionTiming when instantiating task execution times
    static async Algorithm(system, executionTiming) {
        const response = await fetch('http://localhost:8080/', {
            method: 'POST',
            body: JSON.stringify(system),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const status = await response.status;
        if (status == 200) {
            return response.json();
        }
        return null;
    }
    
}

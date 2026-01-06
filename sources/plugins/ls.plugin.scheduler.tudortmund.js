'use strict';

class PluginSchedulerTuDortmund {
    // Plug-in Metadata
    static get Name()     { return 'TU Dortmund (Single Core)'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Type()     { return Plugin.Type.Scheduler; }
    static get Platform() { return Plugin.Platform.SingleCore; }
    static get Category() { return Plugin.Category.Preemptive; }

    
    // Triggers an external web tool (https://github.com/mkuo005/end-to-end) to schedule  
    // task executions.
    // Only supports task sets that have been allocated to the same core.
    static async Result(makespan, executionTiming) {
        // Delete existing schedule.
        await Plugin.DeleteSchedule();
        
        // Retrieve the LET system.
        const systemElementSelected = ['cores', 'inputs','outputs','entities','dependencies','eventChains','constraints'];
        const system = await Plugin.DatabaseContentsGet(systemElementSelected);
        
        // Add the executionTiming to system so that the external tool can access it.
        system['PluginParameters'] = { 'ExecutionTiming' : executionTiming };
        
        // Schedule the LET system with an external web tool.
        const computedSchedule = await this.Algorithm(system);
        if (computedSchedule == null) {
            return
        }
        
        // Save the externally computed task schedule and compute the dependency and event chain instances.
        const scheduleElementSelected = ['schedule'];
        return Plugin.DatabaseContentsDelete(scheduleElementSelected)
            .then(result => Plugin.DatabaseContentsSet(computedSchedule, scheduleElementSelected))
            .then(result => Plugin.CreateAllDependencyAndEventChainInstances()
            .then(result => Plugin.CreateAllNetworkDelayInstances(executionTiming)));
    }

    // Trigger an external scheduling tool.
    static async Algorithm(system) {
        // External tool only supports single core systems.
        if (system[Model.CoreStoreName] != null && Object.keys(system[Model.CoreStoreName]).length > 1) {
            if (!confirm('Multicore systems are not supported by this plugin! Proceed with the scheduling?')) {
                return null;
            }
        }
        
        const url = 'http://localhost:8080/';
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(system),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                alert(response.statusText);
                return null;
            }
        }).catch(error => {
            alert(`${url} could not be reached!`)
            return null;
        });
    }
    
}

'use strict';

class PluginSchedulerTuDortmund {
    // Plug-in Metadata
    static get Name()     { return 'TU Dortmund'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Type()     { return Plugin.Type.Scheduler; }
    static get Category() { return Plugin.Category.Preemptive; }

    
    // Uses an external web tool to schedule the task executions.
    static async Result(makespan, executionTiming) {
        // Delete existing schedule.
        await Plugin.DeleteSchedule();
        
        // Retrieve the LET system.
        const systemElementSelected = ['inputs','outputs','tasks','dependencies','eventChains','constraints'];
        const system = await Plugin.DatabaseContentsGet(systemElementSelected);
        
        // Schedule the LET system with an external web tool.
        const computedSchedule = await this.Algorithm(system, executionTiming);
        if (computedSchedule == null) {
            return
        }
        
        // Save the externally computed task schedule and compute the dependency and event chain instances.
        const scheduleElementSelected = ['schedule'];
        return Plugin.DatabaseContentsDelete(scheduleElementSelected)
            .then(result => Plugin.DatabaseContentsSet(computedSchedule, scheduleElementSelected))
            .then(result => Plugin.CreateAllDependencyAndEventChainInstances(makespan));
    }

    // Trigger an external scheduling tool.
    // TODO: Make use of executionTiming when instantiating task execution times.
    static async Algorithm(system, executionTiming) {
        const url = 'http://localhost:8080/';
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(system),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                alert('Plugin does not support LET tasks with non-zero activation offsets!');
                return null;
            }
        }).catch(error => {
            alert(`${url} could not be reached!`)
            return null;
        });
    }
    
}

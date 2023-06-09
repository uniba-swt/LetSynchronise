'use strict';

class PluginGoalIlp {
    // Plug-in Metadata
    static get Name()     { return 'Minimise End-to-End Response Times (ILP)'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Type()     { return Plugin.Type.Goal; }
    static get Category() { return Plugin.Category.ResponseTime; }

    
    static async Result(scheduler, makespan) {
        // Delete existing schedule.
        await Plugin.DeleteSchedule();
        
        // Retrieve the LET system.
        const systemElementSelected = ['inputs','outputs','tasks','dependencies','eventChains','constraints'];
        const system = await Plugin.DatabaseContentsGet(systemElementSelected);
        
        // Add the makespan to system so that the ILP Solver can access it.
        system['makespan'] = makespan;
        
        // Optimise the LET system with an external web tool.
        const optimisedSchedule = await this.Algorithm(system);
        if (optimisedSchedule == null) {
            return
        }
        
        // Save the externally optimised task schedule and compute the dependency and event chain instances.
        const scheduleElementSelected = ['schedule'];
        return Plugin.DatabaseContentsDelete(scheduleElementSelected)
            .then(result => Plugin.DatabaseContentsSet(optimisedSchedule, scheduleElementSelected))
            .then(result => Plugin.CreateAllDependencyAndEventChainInstances(makespan));
    }
    
    // Trigger an external optimisation tool.
    static async Algorithm(system) {
        const url = 'http://localhost:8181/'
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(system),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                alert('FIXME: Plugin encountered an error!');
                return null;
            }
        }).catch(error => {
            alert(`${url} could not be reached!`)
            return null;
        });
    }
    
}

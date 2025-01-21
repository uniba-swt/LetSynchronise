'use strict';

class PluginGoalUntitled {
    // Plug-in Metadata
    static get Name()     { return 'Untitled Task Scheduling'; }
    static get Author()   { return 'Jamie Lee'; }
    static get Type()     { return Plugin.Type.Goal; }
    static get Platform() { return Plugin.Platform.MultiCore; }
    static get Category() { return Plugin.Category.NonPreemptive; }

    
    // Triggers an external web tool (https://github.com/mkuo005/end-to-end) to schedule  
    // task executions.
    static async Result(scheduler, makespan) {
        // Delete existing schedule.
        await Plugin.DeleteSchedule();
        
        // Retrieve the LET system.
        const systemElementSelected = ['cores', 'inputs','outputs','entities','dependencies','eventChains','constraints', 'devices', 'networkDelays'];
        const system = await Plugin.DatabaseContentsGet(systemElementSelected);
        
        // Add the makespan to system so that the ILP Solver can access it.
        system['PluginParameters'] = { 'Makespan' : makespan };
        
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

    // Trigger an external scheduling tool.
    static async Algorithm(system) {
        const url = 'http://localhost:8181/untitled'
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
            alert(`${url} could not be reached! \n${error}`)
            return null;
        });
    }

    
}

'use strict';

class PluginGoalMultiCore {
    // Plug-in Metadata
    static get Name()     { return 'Multi-Core Scheduling'; }
    static get Author()   { return 'Jamie Lee'; }
    static get Type()     { return Plugin.Type.Goal; }
    static get Platform() { return Plugin.Platform.MultiCore; }
    static get Category() { return Plugin.Category.ResponseTime; }

    
    // Triggers an external web tool (https://github.com/mkuo005/end-to-end) to schedule  
    // task executions.
    static async Result(scheduler, makespan) {
        // Retrieve the LET system.
        const systemElementSelected = ['cores', 'schedule', 'devices', 'networkDelays', 'entities', 'dependencies'];
        const system = await Plugin.DatabaseContentsGet(systemElementSelected);

        if(Object.keys(system['CoreStore']).length < 1) {
            alert('Please add cores.');
            return false;
        }

        if(Object.keys(system['DependencyStore']).length > 0) {
            if (Object.keys(system['NetworkDelayStore']).length < 1) {
                alert('Please add network delays.');
                return false;
            }

            for (const device of system['DeviceStore']) {
                if (!device['delays']) {
                    alert(`Please add protocol delay for ${device['name']}`);
                    return false;
                }
            }   
        }

        // Add the makespan to system so that the ILP Solver can access it.
        system['PluginParameters'] = { 'Makespan' : makespan };
        
        // Optimise the LET system with an external web tool.
        const optimisedSchedule = await this.Algorithm(system);
        if (optimisedSchedule == null) {
            return
        }

        await Plugin.DeleteSchedule();
        
        // Save the externally optimised task schedule and compute the dependency and event chain instances.
        const scheduleElementSelected = ['schedule'];
        return Plugin.DatabaseContentsSet(optimisedSchedule, scheduleElementSelected)
            .then(result => Plugin.CreateAllDependencyAndEventChainInstances(makespan));
    }

    // Trigger an external scheduling tool.
    static async Algorithm(system) {
        const url = 'http://localhost:8181/multicore'

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

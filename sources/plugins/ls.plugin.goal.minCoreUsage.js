'use strict';

class PluginGoalMinimiseCoreUsage {
    // Plug-in Metadata
    static get Name()     { return 'Minimise Core Usage (WCET, ILP)'; }
    static get Author()   { return 'Jamie Lee'; }
    static get Type()     { return Plugin.Type.Goal; }
    static get Platform() { return Plugin.Platform.MultiCore; }
    static get Category() { return Plugin.Category.ResponseTime; }

    
    // Triggers an external web tool (https://github.com/mkuo005/LET-LP-Scheduler) to schedule task executions.
    // Assumes that "no scheduling (identity)" is selected in LetSynchronise to preserve the external web tool's computed schedule.
    static async Result(scheduler, makespan) {
        // Retrieve the LET system.
        const systemElementSelected = ['cores', 'devices', 'networkDelays', 'entities', 'schedule'];
        const system = await Plugin.DatabaseContentsGet(systemElementSelected);

        if (Object.keys(system['CoreStore']).length < 1) {
            alert('Please add cores.');
            return false;
        }

        // Add the makespan to system so that the ILP Solver can access it.
        system['PluginParameters'] = { 'Makespan' : makespan };
        
        // Optimise the LET system with an external web tool.
        const optimisedSchedule = await this.Algorithm(system);
        if (optimisedSchedule == null) {
            return
        }
        
        // Save the externally optimised task schedule and compute the dependency and event chain instances.
        const scheduleElementSelected = ['schedule'];
        return Plugin.DeleteSchedule()
            .then(result => Plugin.DatabaseContentsSet(optimisedSchedule, scheduleElementSelected))
            .then(result => Plugin.CreateAllDependencyAndEventChainInstances());
    }

    // Trigger an external scheduling tool.
    static async Algorithm(system) {
        const url = 'http://localhost:8181/min-core-usage'

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

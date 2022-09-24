'use strict';

class PluginAutoSyncSchedulerTuDortmund {
    // Plug-in Metadata
    static get Name()     { return 'TU Dortmund'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Category() { return PluginAutoSync.Category.Scheduler; }

    
    // Does nothing 
    static async Result(makespan, executionTiming) {
        // Create task instances and execution times.
        
        await PluginAutoSync.DeleteSchedule();
        await PluginAutoSync.CreateAllTaskInstances(makespan, executionTiming);
        await PluginAutoSync.CreateAllDependencyAndEventChainInstances(makespan);
        const systemElementSelected = ['inputs','outputs','tasks','dependencies','eventChains','constraints'];
        const system = await PluginAutoSync.DatabaseContentsGet(systemElementSelected);

        const computedSchedule = await this.Algorithm(system);
        if (computedSchedule == null) {
            alert("Plugin does not support initial offset LET parameters");
            return
        }
        const scheduleElementSelected = ['schedule'];
        const schedule = await PluginAutoSync.DatabaseContentsGet(scheduleElementSelected);
        //let tasks = await schedule[Model.TaskInstancesStoreName];
        

        console.log("ss");
        console.log(computedSchedule[Model.TaskInstancesStoreName]);
        schedule[Model.TaskInstancesStoreName] = computedSchedule[Model.TaskInstancesStoreName];
        /*for (let task of tasks) {
            // Must update the contents of the referenced object.
            task =  this.getTask(system[Model.TaskInstancesStoreName],task.name);
        }*/

        return PluginAutoSync.DatabaseContentsDelete(scheduleElementSelected)
            .then(PluginAutoSync.DatabaseContentsSet(schedule, scheduleElementSelected));
        
    }

    /*static getTask(taskInstances, name) {
        for (let i = 0; i < taskInstances.length; i++) {
            // Must update the contents of the referenced object.
            if (taskInstances[i].name = name) {
                return task;
            }
        }
        return null;
    }*/
    
    // Non-preemptive random.
    static async Algorithm(system) {
        const response = await fetch('http://127.0.0.1:8080/', {
            method: 'POST',
            body: JSON.stringify(system), // string or object
            headers: {
              'Content-Type': 'application/json'
            }
          });
        const status = await response.status;
        let schedule = null;
        if (status == 200)
            schedule = await response.json(); //extract JSON from the http response
        
        return schedule 
    }

    /*
    DatabaseContentsGet element map
        const elementMap = {
            'constraints'  : Model.ConstraintStoreName,
            'dependencies' : Model.DependencyStoreName,
            'eventChains'  : Model.EventChainStoreName,
            'inputs'       : Model.SystemInputStoreName,
            'outputs'      : Model.SystemOutputStoreName,
            'tasks'        : Model.TaskStoreName,
            'schedule'     : [
                                Model.ConstraintInstancesStoreName,
                                Model.DependencyInstancesStoreName,
                                Model.EventChainInstanceStoreName,
                                Model.TaskInstancesStoreName
                             ]
        };
        

    */
    
}

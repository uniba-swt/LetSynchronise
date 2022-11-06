'use strict';

class PluginAutoSyncGoalRandom {
    // Plug-in Metadata
    static get Name()     { return 'Random Task Parameters'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginAutoSync.Category.Goal; }

    
    static async Result(scheduler) {
        const taskElementSelected = ['tasks'];
        const system = await PluginAutoSync.DatabaseContentsGet(taskElementSelected);
        let tasks = system[Model.TaskStoreName];
        
        this.Algorithm(tasks);
        
        return PluginAutoSync.DatabaseContentsDelete(taskElementSelected)
            .then(PluginAutoSync.DatabaseContentsSet(system, taskElementSelected));
    }
    
    // Randomises the task activation offsets and durations.
    // Parameter "tasks" is a copy of a reference to an object.
    static Algorithm(tasks) {
        for (let task of tasks) {
            const maxActivationOffset = task.period - task.wcet;
            const newActivationOffset = maxActivationOffset * Math.random();
            
            const maxDuration = task.period - newActivationOffset;
            const newDuration = (maxDuration - task.wcet) * Math.random() + task.wcet;
            
            // Must update the contents of the referenced object.
            task.activationOffset = newActivationOffset;
            task.duration = newDuration;
        }
    }
    
}

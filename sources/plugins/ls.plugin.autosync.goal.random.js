'use strict';

class PluginAutoSyncGoalRandom {
    // Plug-in Metadata
    static get Name()     { return 'Randomise Task Parameters'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginAutoSync.Category.Goal; }

    
    // Randomises the task activation offsets and durations.
    static async Result() {
        const taskElementSelected = ['tasks'];
        const system = await PluginAutoSync.DatabaseContentsGet(taskElementSelected);
        let tasks = system[Model.TaskStoreName];
        for (let task of tasks) {
            const maxActivationOffset = task.period - task.wcet;
            const newActivationOffset = maxActivationOffset * Math.random();
            
            const maxDuration = task.period - newActivationOffset;
            const newDuration = (maxDuration - task.wcet) * Math.random() + task.wcet;
            
            task.activationOffset = newActivationOffset;
            task.duration = newDuration;
        }
        return PluginAutoSync.DatabaseContentsDelete(taskElementSelected)
            .then(PluginAutoSync.DatabaseContentsSet(system, taskElementSelected));
    }
    
}

'use strict';

class PluginAutoSyncGoalEnd2EndMax {
    // Plug-in Metadata
    static get Name()     { return 'Maximise End-to-End Response Times'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginAutoSync.Category.Goal; }

    
    // Updates the task parameters to maximise end-to-end reponse times.
    static async Result() {
        const taskElementSelected = ['tasks'];
        const system = await PluginAutoSync.DatabaseContentsGet(taskElementSelected);
        let tasks = system[Model.TaskStoreName];
        
        PluginAutoSyncGoalEnd2EndMax.Algorithm(tasks);

        return PluginAutoSync.DatabaseContentsDelete(taskElementSelected)
            .then(PluginAutoSync.DatabaseContentsSet(system, taskElementSelected));
    }
    
    // Parameter "tasks" is a copy of a reference to an object.
    static Algorithm(tasks) {
        for (let task of tasks) {
            // Must update the contents of the referenced object.
            task.activationOffset = 0;
            task.duration = task.period;
        }
    }
    
}

'use strict';

class PluginAutoSyncGoalEnd2EndMax {
    // Plug-in Metadata
    static get Name()     { return 'Maximise End-to-End Response Times'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginAutoSync.Category.Goal; }

    
    // Updates the task parameters to maximise end-to-end reponse times.
    static async Result() {
        const taskElementSelected = ['tasks'];
        const system = await PluginExporter.DatabaseContentsGet(taskElementSelected);
        let tasks = system[Model.TaskStoreName];
        for (let task of tasks) {
            task.activationOffset = 0;
            task.duration = task.period;
        }
        return PluginAutoSync.DatabaseContentsDelete(taskElementSelected)
            .then(PluginAutoSync.DatabaseContentsSet(system, taskElementSelected));
    }
    
}

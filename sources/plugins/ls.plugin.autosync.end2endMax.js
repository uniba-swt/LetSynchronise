'use strict';

class PluginAutoSyncEnd2EndMax {
    // Plug-in Metadata
    static get Name()     { return 'Maximise End-to-End Response Times'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginAutoSync.Category.End2EndMax; }

    
    // Updates the task parameters to maximise end-to-end reponse times.
    static async Result() {
        const taskElementSelected = ['tasks'];
        const system = await PluginExporter.DatabaseContentsGet(taskElementSelected);
        let tasks = system[Model.TaskStoreName];
        for (let task of tasks) {
            task.activationOffset = 0;
            task.duration = task.period;
        }
        return this.database.deleteSystem(taskElementSelected)
            .then(this.database.importSystem(system, taskElementSelected));
    }
    
}

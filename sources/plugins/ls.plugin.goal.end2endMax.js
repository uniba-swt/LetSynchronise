'use strict';

class PluginGoalEnd2EndMax {
    // Plug-in Metadata
    static get Name()     { return 'Maximise End-to-End Response Times'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Type()     { return Plugin.Type.Goal; }
    static get Platform() { return Plugin.Platform.MultiCore; }
    static get Category() { return Plugin.Category.ResponseTime; }

    
    // Updates the task parameters to maximise end-to-end reponse times.
    static async Result(scheduler, makespan) {
        const taskElementSelected = ['tasks'];
        const system = await Plugin.DatabaseContentsGet(taskElementSelected);
        let tasks = system[Model.EntityStoreName];
        
        this.Algorithm(tasks);

        return Plugin.DatabaseContentsDelete(taskElementSelected)
            .then(Plugin.DatabaseContentsSet(system, taskElementSelected));
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

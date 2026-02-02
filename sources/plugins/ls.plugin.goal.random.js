'use strict';

class PluginGoalRandom {
    // Plug-in Metadata
    static get Name()     { return 'Random Task Parameters'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Type()     { return Plugin.Type.Goal; }
    static get Platform() { return Plugin.Platform.MultiCore; }
    static get Category() { return Plugin.Category.ResponseTime; }

    
    static async Result(scheduler, makespan) {
        const taskElementSelected = ['entities'];
        const system = await Plugin.DatabaseContentsGet(taskElementSelected);
        let tasks = (system[Model.EntityStoreName]).filter(entity => entity.type === 'task');
        
        this.Algorithm(tasks);
        
        return Plugin.DatabaseContentsDelete(taskElementSelected)
            .then(Plugin.DatabaseContentsSet(system, taskElementSelected));
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

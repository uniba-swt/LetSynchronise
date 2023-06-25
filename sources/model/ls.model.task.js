'use strict';

class ModelTask {
    updateTasks = null;                 // Callback to function in ls.view.task
    notifyChanges = null;               // Callback to function in ls.view.schedule

    database = null;
    modelDependency = null;
    modelEventChain = null;
        
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller

    registerUpdateTasksCallback(callback) {
        this.updateTasks = callback;
    }
    
    registerNotifyChangesCallback(callback) {
        this.notifyChanges = callback;
    }
    
    
    // -----------------------------------------------------
    // Registration of models
    
    registerModelDatabase(database) {
        this.database = database;
    }
    
    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }
    
    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
    }
    
    
    // -----------------------------------------------------
    // Class methods

   async createTask(parameters) {
        // Delete dependencies that relied on task ports that are no longer exist.
        let dependenciesToRemove = [];
        let dependencies = await this.modelDependency.getAllDependencies();
        for (const dependency of dependencies) {
            // Check whether the dependency destination is this task.
            if (dependency.destination.task == parameters.name) {
                // Check whether the task port still exists.
                if (parameters.inputs.some(input => (input == dependency.destination.port)) == false) {
                    dependenciesToRemove.push(dependency);
                }
            }

            // Check whether the dependency source is this task.
            if (dependency.source.task == parameters.name) {
                // Check whether the task port still exists.
                if (parameters.outputs.some(output => (output == dependency.source.port)) == false) {
                    dependenciesToRemove.push(dependency);
                }
            }
        }        

        // Store task parameters into Database
        return this.database.putObject(Model.TaskStoreName, parameters)
            .then(this.refreshViews())
            .then(this.notifyChanges());
   }
    
    getAllTasks() {
        return this.database.getAllObjects(Model.TaskStoreName);
    }
    
    getAllTaskInstances() {
        return this.database.getAllObjects(Model.TaskInstancesStoreName);
    }

    deleteTask(name) {
        return this.database.deleteObject(Model.TaskStoreName, name)
            .then(this.database.deleteObject(Model.TaskInstancesStoreName, name))
            .then(result => this.refreshViews());
    }
    
    refreshViews() {
        return this.getAllTasks()
            .then(result => this.updateTasks(result))
            .then(result => this.modelDependency.validate());
    }
    
    toString() {
        return "ModelTask";
    }
    
}

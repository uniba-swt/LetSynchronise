'use strict';

class ModelTask {
    updateTasks = null;                 // Callback to function in ls.view.task

    database = null;
    storeName = null;
    
    modelDependency = null;
    modelConstraint = null;
        
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller

    registerUpdateTasksCallback(callback) {
        this.updateTasks = callback;
    }
    
    
    // -----------------------------------------------------
    // Registration of models
    
    registerModelDatabase(database) {
        this.database = database;
    }
    
    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }
    
    registerModelConstraint(modelConstraint) {
        this.modelConstraint = modelConstraint;
    }
    
    // -----------------------------------------------------
    // Class methods

   /*async*/ createTask(parameters) {
        // Store taskParameters into Database
        const logicalTask = ModelLogicalTask.CreateWithParameters(parameters);
        
        /* WORK in progress of issue 48 */
        /*let dependencies = await this.modelDependency.getAllDependencies();
        for (const dependency of dependencies) {
            if (dependency.destination.task == logicalTask.name) { 
                let vaild = false;
                for (const input of logicalTask.inputs) {
                    if (input.name = dependency.destination.port) {
                        vaild = true;
                    }
                }
            }
            if (dependency.source.task == logicalTask.name) { 
                let vaild = false;
                for (const input of logicalTask.inputs) {
                    if (input.name = dependency.source.port) {
                        vaild = true;
                    }
                }
            }
        }*/
        return this.database.putObject(Model.TaskStoreName, logicalTask.parameters)
            .then(this.refreshViews());
    }
    
    getAllTasks() {
        return this.database.getAllObjects(Model.TaskStoreName);
    }
    
    getAllTaskInstances() {
        return this.database.getAllObjects(Model.TaskInstancesStoreName);
    }

    deleteTask(name) {
        return this.modelDependency.deleteDependenciesOfTask(name)
            .then(this.modelConstraint.deleteConstraintsOfTask(name))
            .then(this.database.deleteObject(Model.TaskStoreName, name))
            .then(this.database.deleteAllObjects(Model.TaskInstancesStoreName, name))
            .then(result => this.refreshViews());
    }
    
    refreshViews() {
        return this.getAllTasks()
            .then(result => this.updateTasks(result));
    }
    
    toString() {
        return "ModelTask";
    }
    
}

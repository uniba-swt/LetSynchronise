'use strict';

class ModelTask {
    updateTasks = null;                 // Callback to function in ls.view.task

    database = null;
    storeName = null;
    
    modelDependency = null;
    modelEventChain = null;
        
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
    
    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
    }
    
    // -----------------------------------------------------
    // Class methods

   async createTask(parameters) {
        // Store taskParameters into Database
        const logicalTask = ModelLogicalTask.CreateWithParameters(parameters);
        
        let dependenciesToRemove = [];
        let dependencies = await this.modelDependency.getAllDependencies();
        /* For all dependencies */
        for (const dependency of dependencies) {

            /* The destination of the dependency is this task */
            if (dependency.destination.task == logicalTask.name) { 
                if (logicalTask.inputs.some(input => (input == dependency.destination.port)) == false) {
                    /* remove dependency if no corresponding dependency found*/
                    dependenciesToRemove.push(dependency);
                }
            }

            /* The source of the dependency is this task */
            if (dependency.source.task == logicalTask.name) { 
                if (logicalTask.outputs.some(output => (output == dependency.source.port)) == false) {
                    /* remove dependency if no corresponding dependency found */
                    dependenciesToRemove.push(dependency);
                }
            }
        }        

        return Promise.all(dependenciesToRemove.map(dependency => this.modelDependency.deleteDependency(dependency.name)))
            .then(this.database.putObject(Model.TaskStoreName, logicalTask.parameters))
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

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
        /* For all dependencies */
        let dependencies = await this.modelDependency.getAllDependencies();
        for (const dependency of dependencies) {

            /*The destination of the dependency is this task*/
            if (dependency.destination.task == logicalTask.name) { 
                let vaild = false;
                for (const input of logicalTask.inputs) {
                    if (input == dependency.destination.port) {
                        vaild = true;
                        break;
                    }
                }
                if (vaild == false) {
                    /*remove dependency if no corresponding dependency found*/
                    dependenciesToRemove.push(dependency);
                }
            }

            /*The source of the dependency is this task*/
            if (dependency.source.task == logicalTask.name) { 
                let vaild = false;
                for (const output of logicalTask.outputs) {
                    if (output == dependency.source.port) {
                        vaild = true;
                        break;
                    }
                }
                if (vaild == false) {
                    /*remove dependency if no corresponding dependency found*/
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
        //    .then(this.modelEventChain.deleteEventChainsOfTask(name))
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

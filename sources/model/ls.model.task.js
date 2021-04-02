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

    createTask(parameters) {
        // Store taskParameters into Database
        const logicalTask = ModelLogicalTask.CreateWithParameters(parameters);
        return this.database.putObject(Model.TaskStoreName, logicalTask.parameters)
        	.then(this.refreshViews());
    }
    
    getAllTasks() {
    	return this.database.getAllObjects(Model.TaskStoreName);
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

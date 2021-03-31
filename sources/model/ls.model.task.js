'use strict';

class ModelTask {
    updateTasks = null;                 // Callback to function in ls.view.task
    updateDependencySelectors = null;   // Callback to function in ls.view.dependency
    updateConstraintSelectors = null;   // Callback to function in ls.view.constraint

    database = null;
    modelDependency = null;
    
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller

    registerUpdateTasksCallback(callback) {
        this.updateTasks = callback;
    }
    
    registerUpdateDependencySelectorsCallback(callback) {
        this.updateDependencySelectors = callback;
    }
    
    registerUpdateConstraintSelectorsCallback(callback) {
        this.updateConstraintSelectors = callback;
    }
    
    
    // -----------------------------------------------------
    // Registration of models
    
    registerModelDatabase(database) {
        this.database = database;
    }
    
    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    createTask(parameters) {
        // Store taskParameters into Database
        const logicalTask = ModelLogicalTask.CreateWithParameters(parameters);
        return this.database.storeTask(logicalTask)
        	.then(this.refreshViews());
    }
    
    getAllTasks() {
    	return this.database.getAllTasks();
    }
    
    deleteTask(name) {
		return this.modelDependency.deleteDependenciesOfTask(name)
			.then(this.database.deleteTask(name))
			.then(this.database.deleteTaskInstances(name))
			.then(result => this.refreshViews());
    }
    
    deleteAllTasks() {
    	return this.database.deleteAllTasks()
    		.then(this.database.deleteAllTasksInstances())
    		.then(this.refreshViews());
    }
    
    refreshViews() {
    	return this.getAllTasks()
    		.then(result => { this.updateTasks(result); this.updateDependencySelectors(result) });
    }
    
    toString() {
        return "ModelTask";
    }
    
}

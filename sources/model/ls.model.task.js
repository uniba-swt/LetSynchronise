'use strict';

class ModelTask {
    updateTasks = null;                 // Callback to function in ls.view.task
    updateDependencySelectors = null;   // Callback to function in ls.view.dependency
    updateConstraintSelectors = null;   // Callback to function in ls.view.constraint
    database = null;
    
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
    // Registration of model database
    registerModelDatabase(database) {
        this.database = database;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    createTask(parameters) {
        // Store taskParameters into Database
        const logicalTask = ModelLogicalTask.CreateWithParameters(parameters);
        this.database.storeTask(logicalTask)
        	.then(result => this.getAllTasks())
        	.then(result => { this.updateTasks(result); this.updateDependencySelectors(result) });
    }
    
    getAllTasks() {
    	return this.database.getAllTasks();
    }
    
    deleteTask(name) {
        this.database.deleteTask(name)
        	.then(result => this.getAllTasks())
        	.then(result => { this.updateTasks(result); this.updateDependencySelectors(result) });
    }
    
    toString() {
        return "ModelTask";
    }

    
}

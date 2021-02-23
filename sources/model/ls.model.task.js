'use strict';

class ModelTask {
    updateTasks = null;                 // Callback to function in ls.view.task
    updateDependencySelectors = null;   // Callback to function in ls.view.dependencies
    updateConstraintSelectors = null;   // Callback to function in ls.view.constraints
    database = null;
    
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller

    registerUpdateTaskCallback(callback) {
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

    createTask(taskParameters) {
        // Store taskParameters into Database
        const logicalTask = ModelLogicalTask.CreateWithTaskParameters(taskParameters);
        this.database.storeTask(logicalTask);
        
        const callbacks = [this.updateTasks, this.updateDependencySelectors];
        this.getAllTasks(callbacks);
    }
    
    getAllTasks(callbacks) {
        this.database.getAllTasks(callbacks);
    }

    getAllTaskInstances(callbacks, makespan) {
        alert("hello");
    }
    
    deleteTask(name) {
        alert(`Delete task ${name}`);
        
        const callbacks = [this.updateTasks, this.updateDependencySelectors];
        this.getAllTasks(callbacks);
    }
    
    toString() {
        return "ModelTask";
    }

    
}

'use strict';

class ModelTask {
    updateTasks = null;                 // Callback to function in ls.view.task
    updateDependencySelectors = null;   // Callback to function in ls.view.dependencies
    updateSchedule = null;              // Callback to function in ls.view.schedule
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
    
    registerUpdateScheduleCallback(callback) {
        this.updateSchedule = callback;
    }
    
    // -----------------------------------------------------
    // Registration of model database
    registerModelDatabase(database) {
        this.database = database;
    }
    
    
    // -----------------------------------------------------
    // Class methods
    
    getAllTasks(callbacks) {
        this.database.getAllTasks(callbacks);
    }

    createTask(taskParameters) {
        // Store taskParameters into Database
        const logicalTask = ModelLogicalTask.CreateWithTaskParameters(taskParameters);
        this.database.storeTask(logicalTask);
        
        const callbacks = [this.updateTasks, this.updateDependencySelectors, this.updateSchedule];
        this.getAllTasks(callbacks);
    }
    
    toString() {
        return "ModelTask";
    }

    
}

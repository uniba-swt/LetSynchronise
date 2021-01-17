'use strict';

class ModelTask {
    updateTasks = null;     // Callback to function in ls.view.task
    database = null;
    
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller

    registerUpdateTaskCallback(callback) {
        this.updateTasks = callback;
    }
    
    
    // -----------------------------------------------------
    // Registration of model database
    registerModelDatabase(database) {
        this.database = database;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    getAllTasks() {
        this.database.getAllTasks(this.updateTasks);
    }

    createTask(taskParameters) {
        // Store taskParameters into Database
        const task = ModelLogicalTask.CreateWithTaskParameters(taskParameters);
        this.database.storeTask(this.updateTasks, task);
        
        this.getAllTasks();
    }
    
    toString() {
        return "ModelTask";
    }

    
}

'use strict';

class ModelTask {
    updateTasks = null;
    
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller

    registerUpdateTaskCallback(callback) {
        this.updateTasks = callback;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    createTask(taskParameters) {
        alert(`ModelTask.createTask(${JSON.stringify(taskParameters)})`);
        // Store taskParameters into Database
        
        // Return tasks to updateTasks
        this.updateTasks([taskParameters]);   // Replace [taskParameters] with the actual list of tasks
    }
    
    toString() {
        return "ModelTask";
    }
}

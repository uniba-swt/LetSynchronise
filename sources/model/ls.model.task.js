'use strict';

class ModelTask {
    updateTasks = null;
    
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registeration of callbacks from the controller

    registerUpdateTaskCallback(callback) {
        this.updateTasks = callback;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    createTask(taskParameters) {
        alert(`ModelTask.createTask(${JSON.stringify(taskParameters)})`);
        
        this.updateTasks([taskParameters]);   // Replace [taskParameters] with the actual list of tasks
    }
    
    toString() {
        return "ModelTask";
    }
}

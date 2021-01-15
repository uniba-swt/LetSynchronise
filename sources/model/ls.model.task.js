'use strict';

class ModelTask {
    updateTasks = null;
    //tasks = [];
    constructor() {    }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller

    registerUpdateTaskCallback(callback) {
        this.updateTasks = callback;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    createTask(taskParameters) {
        //alert(`ModelTask.createTask(${JSON.stringify(taskParameters)})`);
        // Store taskParameters into Database

        let t = ModelLogicalTask.CreateWithTaskParameters(taskParameters);
        //this.tasks.push(t);
        model.modelDatabase.storeTask(t);
        model.modelDatabase.getAllTasks(this.updateTasks);
        // Return tasks to updateTasks
        //this.updateTasks(this.tasks);   // Replace [taskParameters] with the actual list of tasks
        
    }
    
    toString() {
        return "ModelTask";
    }

    
}

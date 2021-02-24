'use strict';

class ModelSchedule {

    updateSchedule = null;              // Callback to function in ls.view.schedule

    constructor() { }

    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateScheduleCallback(callback) {
        this.updateSchedule = callback;
    }
    
    
    // -----------------------------------------------------
    // Registration of model database
    registerModelDatabase(database) {
        this.database = database;
    }
    
    
    getSchedule(callbacks, makespan) {
    //    alert("ls.model.schedule.getSchedule");
        console.log("ls.model.schedule.getSchedule");
        this.database.getAllTasks(callbacks);
    }
    
    toString() {
        return "ModelSchedule";
    }
}

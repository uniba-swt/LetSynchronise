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
    
    
    // -----------------------------------------------------
    // Class methods

    // Create a single task instance.
    createTaskInstance(parameters, timePoint) {
    	return {
    		'periodStartTime': timePoint,
    		'letStartTime'   : timePoint + parameters.activationOffset,
    		'letEndTime'     : timePoint + parameters.activationOffset + parameters.letDuration,
    		'periodEndTime'  : timePoint + parameters.period
    	};
    }
    
    // Create all instances of a task within the makespan.
    createTaskInstances(parameters, makespan) {
        let instances = [];
        for (let timePoint = 0; timePoint < makespan; timePoint += parameters.period + parameters.activationOffset) {
			instances.push(this.createTaskInstance(parameters, timePoint));
        }

        this.database.storeTaskInstances({'name': parameters.name, 'value': instances});
    }
    
    // Get all instances of all tasks.
    getAllTasksInstances() {
        return this.database.getAllTasksInstances();
    }
    
    // Delete all instances of a task.
    deleteTaskInstances(name) {
        this.database.deleteTaskInstances(name)
        	.then(result => this.getAllTasksinstances());
    }
    
    getSchedule(makespan) {
        console.log("ls.model.schedule.getSchedule");
        return this.database.getAllTasks()
        	.then(result => { return result });
        /*
        return this.database.getAllTasks()
        	.then(tasks => tasks.forEach(task => this.createTaskInstances(task.parameters, makespan)))
        	.then(result => this.getAllTasksInstances())
        	.then(result => resolve(result));
        */
    }
    
    toString() {
        return "ModelSchedule";
    }
}

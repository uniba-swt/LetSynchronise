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
    		'letEndTime'     : timePoint + parameters.activationOffset + parameters.duration,
    		'periodEndTime'  : timePoint + parameters.period
    	};
    }
    
    // Create all instances of a task within the makespan.
    createTaskInstances(parameters, makespan) {
        let instances = [];
        for (let timePoint = 0; timePoint < makespan; timePoint += parameters.period + parameters.activationOffset) {
			instances.push(this.createTaskInstance(parameters, timePoint));
        }

        return this.database.storeTaskInstances({'name': parameters.name, 'value': instances});
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
    	const promiseAllTasks = this.database.getAllTasks();
    	promiseAllTasks.then(tasks => tasks.forEach(task => this.createTaskInstances(task, makespan)));
    	const promiseAllTasksInstances = this.getAllTasksInstances();
    	
    	return {'promiseAllTasks': promiseAllTasks, 'promiseAllTasksInstances': promiseAllTasksInstances};
    }
    
    toString() {
        return "ModelSchedule";
    }
}

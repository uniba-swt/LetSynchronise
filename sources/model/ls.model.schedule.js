'use strict';

class ModelSchedule {
    updateSchedule = null;              // Callback to function in ls.view.schedule
    
    database = null;

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
        for (let timePoint = parameters.initialOffset; timePoint < makespan; timePoint += parameters.period) {
            instances.push(this.createTaskInstance(parameters, timePoint));
        }

        return this.database.storeTaskInstances({
            'name': parameters.name, 
            'initialOffset': parameters.initialOffset,
            'value': instances
        });
    }
    
    // Create a single dependency instance.
    createDependencyInstance(dependency, sourceIndex, sourceInstance, destinationIndex, destinationInstance) {
        return {
            'receiveEvent': {
                'task': dependency.destination.task,
                'port': dependency.destination.port,
                'taskInstance': destinationIndex,
                'timestamp': destinationInstance.letStartTime
            },
            'sendEvent': {
                'task': dependency.source.task,
                'port': dependency.source.port,
                'taskInstance': sourceIndex,
                'timestamp': sourceInstance.letEndTime
            }       
        };
    }

	// Returns the latest LET end time before a given time point from an array of task instances.
    getLatestLetEndTime(taskInstances, timePoint) {
    	for (let taskIndex = taskInstances.length - 1; taskIndex > -1;  taskIndex--) {
    		const taskInstance = taskInstances[taskIndex];
			if (taskInstance.letEndTime <= timePoint) {
				return [taskIndex, taskInstance];
			}
		}
		
		return [ 
			-1,
			{
				'periodStartTime': 0,
				'letStartTime': 0,
				'letEndTime': 0,
				'periodEndTime': 0
			}
		]
    }

    // Create all instances of a dependency.
    createDependencyInstances(dependency) {
        // Get all instances of the source and destination tasks
        // If one of the tasks is Model.SystemInterfaceName, we duplicate the other task
        const sourceTaskInstancesPromise = (dependency.source.task != Model.SystemInterfaceName)
                                         ? this.database.getTaskInstances(dependency.source.task)
                                         : this.database.getTaskInstances(dependency.destination.task);
    	const destinationTaskInstancesPromise = (dependency.destination.task != Model.SystemInterfaceName)
                                              ? this.database.getTaskInstances(dependency.destination.task)
                                              : this.database.getTaskInstances(dependency.source.task);
        
        return Promise.all([
            sourceTaskInstancesPromise, 
            destinationTaskInstancesPromise
        ]).then(([sourceTaskInstances, destinationTaskInstances]) => {
			const sourceInstances = sourceTaskInstances.value;
			const destinationInstances = destinationTaskInstances.value;
        
            let instances = [];
            for (let destinationIndex = destinationInstances.length - 1; destinationIndex > -1;  destinationIndex--) {
                // Find latest sourceInstance
                const destinationInstance = destinationInstances[destinationIndex];
                const [sourceIndex, sourceInstance] = this.getLatestLetEndTime(sourceInstances, destinationInstance.letStartTime);
                
                instances.unshift(this.createDependencyInstance(dependency, sourceIndex, sourceInstance, destinationIndex, destinationInstance));
            }
            
            return this.database.storeDependencyInstances({
                'name': dependency.name,
                'value': instances
            });
        });
    }
    
    
    // Get task schedule for given makespan.
    getSchedule(makespan) {    
        const promiseAllTasks = this.database.getAllTasks();
        const promiseAllTasksInstances = promiseAllTasks
        	.then(tasks => Promise.all(tasks.map(task => this.createTaskInstances(task, makespan))))
        	.then(result => this.database.getAllTasksInstances());
        
        const promiseAllDependenciesInstances = this.database.getAllDependencies()
            .then(dependencies => Promise.all(dependencies.map(dependency => this.createDependencyInstances(dependency))))
            .then(result => this.database.getAllDependenciesInstances());
        
        return {
            'promiseAllTasks': promiseAllTasks, 
            'promiseAllTasksInstances': promiseAllTasksInstances,
            'promiseAllDependenciesInstances': promiseAllDependenciesInstances
        };
    }
    
    
    toString() {
        return "ModelSchedule";
    }
}

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

        return this.database.putObject(Model.TaskInstancesStoreName, {
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
        return Promise.all([
            this.database.getObject(Model.TaskInstancesStoreName, dependency.source.task), 
            this.database.getObject(Model.TaskInstancesStoreName, dependency.destination.task)
        ]).then(([sourceTaskInstances, destinationTaskInstances]) => {
            let instances = [];
            if (dependency.source.task == Model.SystemInterfaceName) {
                // Dependency is system input --> task
                const destinationInstances = destinationTaskInstances.value;

                for (let destinationIndex = destinationInstances.length - 1; destinationIndex > -1;  destinationIndex--) {
                    // Make the source index and instance of system input the same as the destination
                    const destinationInstance = destinationInstances[destinationIndex];
                    instances.unshift(this.createDependencyInstance(dependency, destinationIndex, {letEndTime: destinationInstance.letStartTime}, destinationIndex, destinationInstance));
                }
            } else if (dependency.destination.task == Model.SystemInterfaceName) {
                // Dependency is task --> system output
                const sourceInstances = sourceTaskInstances.value;
                
                for (let sourceIndex = sourceInstances.length - 1; sourceIndex > -1;  sourceIndex--) {
                    // Make the destination index and instance of the system output the same as the source
                    const sourceInstance = sourceInstances[sourceIndex];
                    instances.unshift(this.createDependencyInstance(dependency, sourceIndex, sourceInstance, sourceIndex, {letStartTime: sourceInstance.letEndTime}));
                }
            } else {
                // Dependency is between two tasks
                const sourceInstances = sourceTaskInstances.value;
                const destinationInstances = destinationTaskInstances.value;
        
                for (let destinationIndex = destinationInstances.length - 1; destinationIndex > -1;  destinationIndex--) {
                    // Find latest sourceInstance
                    const destinationInstance = destinationInstances[destinationIndex];
                    const [sourceIndex, sourceInstance] = this.getLatestLetEndTime(sourceInstances, destinationInstance.letStartTime);
                
                    instances.unshift(this.createDependencyInstance(dependency, sourceIndex, sourceInstance, destinationIndex, destinationInstance));
                }
            }
        
            return this.database.putObject(Model.DependencyInstancesStoreName, {
                'name': dependency.name,
                'value': instances
            });
        });
    }
    
    
    // Get task schedule for given makespan.
    getSchedule(makespan) {
        const promiseAllTasks = this.database.getAllObjects(Model.TaskStoreName);
        const promiseAllTasksInstances = promiseAllTasks
            .then(tasks => Promise.all(tasks.map(task => this.createTaskInstances(task, makespan))))
            .then(result => this.database.getAllObjects(Model.TaskInstancesStoreName));
        
        const promiseAllDependenciesInstances = this.database.getAllObjects(Model.DependencyStoreName)
            .then(dependencies => Promise.all(dependencies.map(dependency => this.createDependencyInstances(dependency))))
            .then(result => this.database.getAllObjects(Model.DependencyInstancesStoreName));
        
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

'use strict';

class ModelSchedule {    
    database = null;

    modelTask = null;
    modelDependency = null;
    modelEventChain = null;
    modelConstraint = null;

    constructor() { }

    
    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }
    
    registerModelTask(modelTask) {
        this.modelTask = modelTask;
    }

    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }

    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
    }
    
    registerModelConstraint(modelConstraint) {
        this.modelConstraint = modelConstraint;
    }
    
        
    // -----------------------------------------------------
    // Class methods

    // Create a single task instance.
    createTaskInstance(index, parameters, timePoint) {
        // TODO: Scheduler should create execution intervals
        const executionTime = Utility.Random(parameters.bcet, parameters.acet, parameters.wcet, parameters.distribution);
    
        return {
            'instance'          : index,
            'periodStartTime'   : timePoint,
            'letStartTime'      : timePoint + parameters.activationOffset,
            'letEndTime'        : timePoint + parameters.activationOffset + parameters.duration,
            'periodEndTime'     : timePoint + parameters.period,
            'executionTime'     : executionTime,
            'executionIntervals': [ new Utility.Interval(timePoint + parameters.activationOffset, timePoint + parameters.activationOffset + executionTime/2),
                                    new Utility.Interval(timePoint + parameters.activationOffset + parameters.duration - executionTime/2, timePoint + parameters.activationOffset + parameters.duration) ]
        };
    }
    
    // Create all instances of a task within the makespan.
    createTaskInstances(parameters, makespan) {
        let instances = [];
        for (let timePoint = parameters.initialOffset; timePoint < makespan; timePoint += parameters.period) {
            instances.push(this.createTaskInstance(instances.length, parameters, timePoint));
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
            'instance'    : -1,
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
    createDependencyInstances(dependency, makespan) {
        // Get all instances of the source and destination tasks
        // If one of the tasks is Model.SystemInterfaceName, we duplicate the other task
        return Promise.all([
            this.database.getObject(Model.TaskInstancesStoreName, dependency.source.task), 
            this.database.getObject(Model.TaskInstancesStoreName, dependency.destination.task)
        ]).then(([sourceTaskInstances, destinationTaskInstances]) => {            
            let instances = [];
            if (dependency.source.task == Model.SystemInterfaceName) {
                // Dependency is system input --> task
                const destinationInstances = destinationTaskInstances ? destinationTaskInstances.value : 0;
                
                if (destinationInstances.length > 0) {
					const numberOfInstances = destinationInstances.length - (destinationInstances[destinationInstances.length - 1].letStartTime > makespan);
					for (let destinationIndex = numberOfInstances - 1; destinationIndex > -1;  destinationIndex--) {
						// Make the source index and instance of system input the same as the destination
						const destinationInstance = destinationInstances[destinationIndex];
						instances.unshift(this.createDependencyInstance(dependency, destinationIndex, {letEndTime: destinationInstance.letStartTime}, destinationIndex, destinationInstance));
					}
                }
            } else if (dependency.destination.task == Model.SystemInterfaceName) {
                // Dependency is task --> system output
                const sourceInstances = sourceTaskInstances ? sourceTaskInstances.value : 0;
                
                if (sourceInstances.length > 0) {
					const numberOfInstances = sourceInstances.length - (sourceInstances[sourceInstances.length - 1].letEndTime > makespan);
					for (let sourceIndex = numberOfInstances - 1; sourceIndex > -1;  sourceIndex--) {
						// Make the destination index and instance of the system output the same as the source
						const sourceInstance = sourceInstances[sourceIndex];
						instances.unshift(this.createDependencyInstance(dependency, sourceIndex, sourceInstance, sourceIndex, {letStartTime: sourceInstance.letEndTime}));
					}
                }
            } else {
                // Dependency is task --> task
                const sourceInstances = sourceTaskInstances ? sourceTaskInstances.value : 0;
                const destinationInstances = destinationTaskInstances ? destinationTaskInstances.value : 0;

                if (destinationInstances.length > 0) {
					const numberOfInstances = destinationInstances.length - (destinationInstances[destinationInstances.length - 1].letStartTime > makespan);
					for (let destinationIndex = numberOfInstances - 1; destinationIndex > -1;  destinationIndex--) {
						// Find latest sourceInstance
						const destinationInstance = destinationInstances[destinationIndex];
						const [sourceIndex, sourceInstance] = this.getLatestLetEndTime(sourceInstances, destinationInstance.letStartTime);
				
						instances.unshift(this.createDependencyInstance(dependency, sourceIndex, sourceInstance, destinationIndex, destinationInstance));
					}
                }
            }
            
            // Sort the instances in chronological order and give them an instance number
            instances.sort((first, second) => { first.receiveEvent.timestamp - second.receiveEvent.timestamp });
            instances.forEach((instance, index) => instance.instance = index);
        
            return this.database.putObject(Model.DependencyInstancesStoreName, {
                'name': dependency.name,
                'value': instances
            });
        });
    }
    
    // Creates all instances of an event chain from the given dependencyInstances.
    // Each event chain instance is linear with no branching.
    // Event chain instances are found via forward reachability from the event chain's starting dependency.
    createEventChainInstances(dependencyInstances, chain) {
        let nextSegment = chain.generator();
        const startDependencies = this.getDependencyInstances(dependencyInstances, nextSegment.next().value);
        let chainInstances = startDependencies.map(dependency => new ChainInstance(chain.name, dependency));

        for (const segment of nextSegment) {
            let updatedChainInstances = [];
            for (const chainInstance of chainInstances) {

                const nextEventInstances = this.getSpecificDependencyInstances(dependencyInstances, segment, chainInstance.last.segment.receiveEvent.taskInstance);
                for (const nextEventInstance of nextEventInstances) {
                    let chainInstanceCopy = chainInstance.copy;
                    chainInstanceCopy.last.successor = new ChainInstance(null, nextEventInstance);
                    updatedChainInstances.push(chainInstanceCopy);
                }
            }

            chainInstances = updatedChainInstances;
        }

        return Promise.all(chainInstances.map((chainInstance, index) => {
            chainInstance.name = `${chainInstance.name}-${index}`;
            this.modelEventChain.createEventChainInstance(chainInstance);
        }));
    }
    
    getDependencyInstances(dependencyInstances, dependency) {
        return dependencyInstances.filter(dependencyInstance => (dependencyInstance.name == dependency.name))
                                  .flatMap(dependencyInstance => dependencyInstance.value
                                  .map(instance => { return { 'name': dependency.name, ...instance }; }));
    }

    getSpecificDependencyInstances(dependencyInstances, dependency, taskInstance) {
        // Task instance of currentEventInstance.receiveEvent and nextEventInstances.sendEvent have to match.
        return this.getDependencyInstances(dependencyInstances, dependency)
                   .filter(dependencyInstance => (dependencyInstance.sendEvent.taskInstance == taskInstance));
    }
    
    // Creates all event chains that go from the constraint's source port to its destination port.
    // Each event chain is linear with no branching.
    // Event chains are found via backwards reachability from the constraint's destination port.
    // Assumes that a task's destination port can be reached by any of the task's source ports.
    createInferredEventChains(allDependencies, name, source, destination) {
        const predecessorDependencies = this.getPredecessorDependencies(allDependencies, destination.task);
        let chains = predecessorDependencies.map(dependency => new Chain(dependency));

        let completeChains = [];
        while (chains.length) {
            let updatedChains = [];
            for (const chain of chains) {
                if (chain.startsWith(source)) {
                    // Event chain is complete
                    chain.name = `${name}_${completeChains.length}`;
                    completeChains.push(chain);
                    continue;
                }

                // Event chain is still incomplete, so add predecessors.
                // Limitation: Ignore feedback loops.
                const predecessorDependencies = this.getPredecessorDependencies(allDependencies, chain.sourceTask)
                                                    .filter(predecessorDependency => !chain.includes(predecessorDependency));
                for (const predecessorDependency of predecessorDependencies) {
                   let newChain = new Chain(predecessorDependency);
                   newChain.successor = chain;
                   updatedChains.push(newChain);
                }
            }

            chains = updatedChains;
        }

        return completeChains;
    }

    getPredecessorDependencies(dependencies, task) {
        return dependencies.filter(dependency => (dependency.destination.task == task));
    }
    
    createAllInferredEventChains() {
        // Get all constraints and all dependencies.
        // Infer all event chains from each constraint, and store them in the model database.
        // Retrieve the inferred event chains from the database, and transform them back into Chain objects.
        const promiseAllConstraints = this.modelConstraint.getAllConstraints();
        const promiseAllDependencies = this.modelDependency.getAllDependencies();
        const promiseAllInferredEventChains = Promise.all([promiseAllConstraints, promiseAllDependencies])
            .then(([allConstraints, allDependencies]) => allConstraints
                .forEach(constraint => this.createInferredEventChains(allDependencies, constraint.name, constraint.source, constraint.destination)))
            .then(result => this.modelEventChain.getAllEventChains())
        
        return promiseAllInferredEventChains;
    }
    
    
    reinstantiateTasks(makespan) {
        // Generate task instances.
        const promiseAllTasks = this.modelTask.getAllTasks();
        const promiseAllTasksInstances = promiseAllTasks
            .then(tasks => Promise.all(tasks.map(task => this.createTaskInstances(task, makespan))))
            .then(result => this.database.getAllObjects(Model.TaskInstancesStoreName));
        
        return promiseAllTasksInstances;
    }
    
    // Get task schedule for given makespan.
    getSchedule(makespan) {
        const promiseAllTasks = this.modelTask.getAllTasks();
        const promiseAllTasksInstances = this.database.getAllObjects(Model.TaskInstancesStoreName);
        
        // Generate dependency instances.
        const promiseAllDependenciesInstances = this.modelDependency.getAllDependencies()
            .then(dependencies => Promise.all(dependencies.map(dependency => this.createDependencyInstances(dependency, makespan))))
            .then(result => this.database.getAllObjects(Model.DependencyInstancesStoreName));
        
        // Get all event chains and all dependency instances.
        // Create all instances of each event chain, and store them in the model database.
        // Retrieve the event chain instances from the database, and transform them back into ChainInstance objects.
         const promiseAllEventChains = this.modelEventChain.getAllEventChains();
         const promiseDeleteChainInstances = this.modelEventChain.deleteAllEventChainsInstances();
         const promiseAllEventChainInstances = Promise.all([promiseAllEventChains, promiseAllDependenciesInstances, promiseDeleteChainInstances])
             .then(([allEventChains, allDependencyInstances, _]) => allEventChains
                 .forEach(chain => this.createEventChainInstances(allDependencyInstances, chain)))
             .then(result => this.modelEventChain.getAllEventChainsInstances())
        
        return {
            'promiseAllTasks': promiseAllTasks, 
            'promiseAllTasksInstances': promiseAllTasksInstances,
            'promiseAllDependenciesInstances': promiseAllDependenciesInstances,
            'promiseAllEventChainInstances': promiseAllEventChainInstances
        };
    }
    
    
    toString() {
        return "ModelSchedule";
    }
}

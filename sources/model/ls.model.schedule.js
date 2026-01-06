'use strict';

class ModelSchedule {    
    database = null;

    modelDevice = null;
    modelNetworkDelay = null;
    modelEntity = null;
    modelDependency = null;
    modelEventChain = null;
    modelConstraint = null;

    constructor() { }

    
    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }

    registerModelDevice(modelDevice) {
        this.modelDevice = modelDevice;
    }
    
    registerModelNetworkDelay(modelNetworkDelay) {
        this.modelNetworkDelay = modelNetworkDelay;
    }
    
    registerModelEntity(modelEntity) {
        this.modelEntity = modelEntity;
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
    createTaskInstance(index, parameters, timePoint, executionTiming) {
        let executionTime = null;
        switch (executionTiming) {
            case 'Best Case':
                executionTime = parameters.bcet;
                break;
            case 'Worst Case':
                executionTime = parameters.wcet;
                break;
            default:
                executionTime = Utility.RandomInteger(parameters.bcet, parameters.acet, parameters.wcet, parameters.distribution);
                break;
        }
        
        return {
            'instance'          : index,
            'periodStartTime'   : timePoint,
            'letStartTime'      : timePoint + parameters.activationOffset,
            'letEndTime'        : timePoint + parameters.activationOffset + parameters.duration,
            'periodEndTime'     : timePoint + parameters.period,
            'executionTime'     : executionTime,
            'executionIntervals': [ ],
            'currentCore'       : parameters.core       // Core decided by the designer, which can later be modified by the task scheduler.
        };
    }
    
    // Create all instances of a task within the makespan.
    createTaskInstances(parameters, makespan, executionTiming) {
        let instances = [ ];
        for (let timePoint = parameters.initialOffset; timePoint < makespan; timePoint += parameters.period) {
            instances.push(this.createTaskInstance(instances.length, parameters, timePoint, executionTiming));
        }

        return this.database.putObject(Model.EntityInstancesStoreName, {
            'name': parameters.name, 
            'type': parameters.type,
            'initialOffset': parameters.initialOffset,
            'value': instances
        });
    }
    
    // Create all instances of all tasks within the makespan.
    createAllTaskInstances(makespan, executionTiming) {
        const promiseAllTasksInstances = this.modelEntity.getAllTasks()
            .then(tasks => Promise.all(tasks.map(task => {
                if (task.type === "task") {
                    this.createTaskInstances(task, makespan, executionTiming);
                }
                })))
            .then(result => this.database.getAllObjects(Model.EntityInstancesStoreName));
        return promiseAllTasksInstances;
    }
    
    // Create a single dependency instance.
    createDependencyInstance(dependency, sourceInstance, destinationInstance) {
        return {
            'instance': -1,
            'receiveEvent': {
                'task': dependency.destination.task,
                'port': dependency.destination.port,
                'taskInstance': destinationInstance.instance,
                'timestamp': destinationInstance.letStartTime
            },
            'sendEvent': {
                'task': dependency.source.task,
                'port': dependency.source.port,
                'taskInstance': sourceInstance.instance,
                'timestamp': sourceInstance.letEndTime
            }       
        };
    }

    // Returns the latest LET end time before a given time point from an array of task instances.
    getLatestLetEndTime(taskInstances, timePoint) {
        for (let taskIndex = taskInstances.length - 1; taskIndex > -1;  taskIndex--) {
            const taskInstance = taskInstances[taskIndex];
            if (taskInstance.letEndTime <= timePoint) {
                return taskInstance;
            }
        }
        
        return {
            'periodStartTime': 0,
            'letStartTime': 0,
            'letEndTime': 0,
            'periodEndTime': 0
        }
    }

    // Create all instances of a dependency.
    createDependencyInstances(dependency, makespan) {
        // Get all instances of the source and destination tasks
        // If one of the tasks is Model.SystemInterfaceName, we duplicate the other task
        return Promise.all([
            this.database.getObject(Model.EntityInstancesStoreName, dependency.source.task), 
            this.database.getObject(Model.EntityInstancesStoreName, dependency.destination.task)
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
						instances.unshift(this.createDependencyInstance(dependency, {instance: destinationInstance.instance, letEndTime: destinationInstance.letStartTime}, destinationInstance));
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
						instances.unshift(this.createDependencyInstance(dependency, sourceInstance, {instance: sourceInstance.instance, letStartTime: sourceInstance.letEndTime}));
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
						const sourceInstance = this.getLatestLetEndTime(sourceInstances, destinationInstance.letStartTime);
				
						instances.unshift(this.createDependencyInstance(dependency, sourceInstance, destinationInstance));
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
    
    // Create all instances of all dependencies.
    createAllDependencyInstances(makespan) {
        return this.modelDependency.getAllDependencies()
            .then(dependencies => Promise.all(dependencies.map(dependency => this.createDependencyInstances(dependency, makespan))));
    }
    
    // TOOD: Extend to support SL-LET network delays.
    // Creates all instances of an event chain from the given dependencyInstances.
    // Each event chain instance is linear with no branching.
    // Event chain instances are found via forward reachability from the event chain's starting dependency.
    createEventChainInstances(dependencyInstances, chain) {
        const filteredInstances = dependencyInstances;
        
        let nextSegment = chain.generator();
        const startDependencies = this.getDependencyInstances(filteredInstances, nextSegment.next().value);
        let chainInstances = startDependencies.map(dependency => new ChainInstance(chain.name, dependency));

        for (const segment of nextSegment) {
            let updatedChainInstances = [];
            for (const chainInstance of chainInstances) {

                const nextEventInstances = this.getSpecificDependencyInstances(filteredInstances, segment, chainInstance.last.segment.receiveEvent.taskInstance);
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
    
    // Create all instances of each event chain, and store them in the model database.
    createAllDependencyAndEventChainInstances() {
        // Get all event chain definitions and all dependency instances.
        const promiseAllEventChains = this.modelEventChain.getAllEventChains();
        const promiseAllDependenciesInstances = this.createAllDependencyInstances()
            .then(result => this.database.getAllObjects(Model.DependencyInstancesStoreName));
        
        return Promise.all([promiseAllEventChains, promiseAllDependenciesInstances])
            .then(([allEventChains, allDependencyInstances]) => allEventChains
                 .forEach(chain => this.createEventChainInstances(allDependencyInstances, chain)));
    }
    
    deleteSchedule() {
        // Delete all task, dependency, and event chain instances.
        return this.database.deleteSchedule();
    }
    
    // Get task schedule for given makespan.
    getSchedule() {
        return {
            'promiseAllTasks': this.modelEntity.getAllTasks(),
            'promiseAllTasksInstances': this.database.getAllObjects(Model.EntityInstancesStoreName),
            'promiseAllDependenciesInstances': this.modelDependency.getAllDependencyInstances(),
            'promiseAllEventChainInstances': this.modelEventChain.getAllEventChainsInstances()
        };
    }
    
    // Create all network delay instances from all dependency instances.
    // All task-to-core/device allocations need to be known.
    createAllNetworkDelayInstances(executionTiming) {
        return Promise.all([
            this.modelDependency.getAllDependencyInstances(),
            this.modelDependency.getAllDependencies()
        ]).then(async ([dependencyInstances, dependencies]) => {
            const filteredDependencies = dependencyInstances.filter(instance =>
                                            instance.value.length > 0
                                            && instance.value[0].sendEvent.task !== Model.SystemInterfaceName
                                            && instance.value[0].receiveEvent.task !== Model.SystemInterfaceName);
            
            let instancesPromises = [ ];
            for (const dependency of filteredDependencies) {
                const currentDependency = dependencies.find(item => dependency.name === item.name)
                const sourceInstances = await this.database.getObject(Model.EntityInstancesStoreName, dependency.value[0].sendEvent.task);
                const destInstances = await this.database.getObject(Model.EntityInstancesStoreName, dependency.value[0].receiveEvent.task);
                
                let instances = [ ];
                let encapsulationDelayInstances = [ ];
                let networkDelayInstances = [ ];
                let decapsulationDelayInstances = [ ];

                for (let destIndex = destInstances.value.length - 1; destIndex > -1; destIndex--) {
                    const destInstance = destInstances.value[destIndex];
                    let sourceInstance = this.getLatestLetEndTime(sourceInstances.value, destInstance.letStartTime)

                    if (sourceInstance.instance == -1) {
                        continue;
                    }

                    let sourceDevice = null;
                    let destDevice = null;
                    let networkDelay = null;
                    let devicesAndNetworkDelay = await this.getDevicesAndNetworkDelay(sourceInstance, destInstance);

                    while (devicesAndNetworkDelay) {
                        [sourceDevice, destDevice, networkDelay] = devicesAndNetworkDelay;
                        // FIXME: For random executionTiming, the total delay will be inconsistent with the actual delaya!
                        const totalDelay = this.calculateTotalDelay(sourceDevice, destDevice, networkDelay, executionTiming);
                
                        let newSourceInstance = this.getLatestLetEndTime(sourceInstances.value, destInstance.letStartTime - totalDelay);
                
                        if (sourceInstance.instance !== newSourceInstance.instance ) {
                            devicesAndNetworkDelay = await this.getDevicesAndNetworkDelay(newSourceInstance, destInstance);
                            sourceInstance = newSourceInstance;
                        } else {
                            if (newSourceInstance.currentCore.device == destInstance.currentCore.device) {
                                devicesAndNetworkDelay = null;
                            }
                            
                            break;
                        }
                    }

                    if (sourceInstance.instance == -1) {
                        continue;
                    }

                    if (devicesAndNetworkDelay) {
                        // Do not add duplicate network delays.
                    
                        const encapsulationDelayInstance = ModelEntity.CreateDelayInstance(
                            encapsulationDelayInstances.length,
                            sourceInstance.letEndTime,
                            ModelSchedule.GetDelayTime(sourceDevice.delays[0], executionTiming),
                            sourceDevice,
                            destDevice, 
                            currentDependency
                        );
                        if (!ModelSchedule.NetworkDelayInstanceIsDuplicate(encapsulationDelayInstances, encapsulationDelayInstance)) {
                            encapsulationDelayInstances.unshift(encapsulationDelayInstance);
                            const encapDependency = this.modelDependency.createDelayDependency(currentDependency, 'encapsulation');
                            instances.unshift(this.createDependencyInstance(encapDependency, sourceInstance, encapsulationDelayInstances[0]));
                        }
                        
                        const networkDelayInstance = ModelEntity.CreateDelayInstance(
                            networkDelayInstances.length,
                            encapsulationDelayInstances[0].letEndTime,
                            ModelSchedule.GetDelayTime(networkDelay, executionTiming),
                            sourceDevice,
                            destDevice, 
                            currentDependency
                        );
                        if (!ModelSchedule.NetworkDelayInstanceIsDuplicate(networkDelayInstances, networkDelayInstance)) {
                            networkDelayInstances.unshift(networkDelayInstance);
                            const netDependency = this.modelDependency.createDelayDependency(currentDependency, 'network');
                            instances.unshift(this.createDependencyInstance(netDependency, encapsulationDelayInstances[0], networkDelayInstances[0]));
                        }

                        const decapsulationDelayInstance = ModelEntity.CreateDelayInstance(
                            decapsulationDelayInstances.length,
                            networkDelayInstances[0].letEndTime,
                            ModelSchedule.GetDelayTime(destDevice.delays[0], executionTiming),
                            sourceDevice,
                            destDevice, 
                            currentDependency
                        );
                        if (!ModelSchedule.NetworkDelayInstanceIsDuplicate(decapsulationDelayInstances, decapsulationDelayInstance)) {
                            decapsulationDelayInstances.unshift(decapsulationDelayInstance);
                            const decapDependency = this.modelDependency.createDelayDependency(currentDependency, 'decapsulation');
                            instances.unshift(this.createDependencyInstance(decapDependency, networkDelayInstances[0], decapsulationDelayInstances[0]));
                        }

                        const destDependency = this.modelDependency.createDelayDependency(currentDependency);
                        instances.unshift(this.createDependencyInstance(destDependency, decapsulationDelayInstances[0], destInstance));
                    } else {
                        instances.unshift(this.createDependencyInstance(currentDependency, sourceInstance, destInstance));
                    }                        
                }

                if (encapsulationDelayInstances.length > 0 && networkDelayInstances.length > 0 && decapsulationDelayInstances.length > 0) {
                    encapsulationDelayInstances.sort((first, second) => { first.letStartTime - second.letStartTime });
                    encapsulationDelayInstances.forEach((instance, index) => instance.instance = index);
                    
                    networkDelayInstances.sort((first, second) => { first.letStartTime - second.letStartTime });
                    networkDelayInstances.forEach((instance, index) => instance.instance = index);

                    decapsulationDelayInstances.sort((first, second) => { first.letStartTime - second.letStartTime });
                    decapsulationDelayInstances.forEach((instance, index) => instance.instance = index);
                    
                    instancesPromises.push(this.modelEntity.createAllDelayInstances(currentDependency, encapsulationDelayInstances, networkDelayInstances, decapsulationDelayInstances));
                }

                instances.sort((first, second) => {
                    const timestampComparison = first.sendEvent.timestamp - second.sendEvent.timestamp;
                    return timestampComparison === 0 ? first.receiveEvent.taskInstance - second.receiveEvent.taskInstance : timestampComparison;
                });
    
                instances.forEach((instance, index) => instance.instance = index);
                
                const newDependencyInstance = this.database.putObject(Model.DependencyInstancesStoreName, {
                    'name': currentDependency.name, 
                    'value': instances
                });
                instancesPromises.push(newDependencyInstance);
            }
            
            return Promise.all(instancesPromises);
        })
    }
    
    static NetworkDelayInstanceIsDuplicate(instances, other) {
        if (instances.length == 0) {
            return false;
        }
    
        // We do not check the instance number because it is unimportant.
        // We do not check the executionTime or letEndTime because a duplicate instance should have the same times.
        //
        return instances.find(instance =>
            instance.destinationDevice == other.destinationDevice
            && instance.sourceDevice == other.sourceDevice
            && instance.letStartTime == other.letStartTime
        ) != null;
    }

    calculateTotalDelay(source, dest, network, executionTiming) {
        return ModelSchedule.GetDelayTime(source.delays[0], executionTiming) +
               ModelSchedule.GetDelayTime(dest.delays[0], executionTiming) +
               ModelSchedule.GetDelayTime(network, executionTiming);
    }
    
    static GetDelayTime(delay, executionTiming) {
        switch (executionTiming) {
            case 'Best Case':
                return delay.bcdt;
            case 'Worst Case':
                return delay.wcdt;
            default:
                return Utility.RandomInteger(delay.bcdt, delay.acdt, delay.wcdt, delay.distribution);
        }
    }

    async getDevicesAndNetworkDelay(source, dest) {
        if (dest.currentCore?.device &&
            source.currentCore?.device &&
            dest.currentCore.device !== 'Default' &&
            source.currentCore.device !== 'Default' &&
            dest.currentCore.device !== source.currentCore.device) {
                const [sourceDevice, destDevice] = await Promise.all([
                    this.modelDevice.getDevice(source.currentCore.device),
                    this.modelDevice.getDevice(dest.currentCore.device)
                ]);

                const networkDelay = await this.modelNetworkDelay.getNetworkDelay(sourceDevice.name, destDevice.name);

                return [sourceDevice, destDevice, networkDelay];
        } else {
            return null;
        }
    }
    
    toString() {
        return "ModelSchedule";
    }
}

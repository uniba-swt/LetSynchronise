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
        return this.modelEntity.getAllTasks()
            .then(tasks => Promise.all(tasks.map(task => this.createTaskInstances(task, makespan, executionTiming))))
            .then(result => this.database.getAllObjects(Model.EntityInstancesStoreName));
    }
    
    // Create a single dependency instance.
    createDependencyInstance(dependency, sourceInstance, destinationInstance) {
        return {
            'instance': -1,
            'receiveEvent': {
                'entity': dependency.destination.entity,
                'port': dependency.destination.port,
                'entityInstance': destinationInstance.instance,
                'timestamp': destinationInstance.letStartTime
            },
            'sendEvent': {
                'entity': dependency.source.entity,
                'port': dependency.source.port,
                'entityInstance': sourceInstance.instance,
                'timestamp': sourceInstance.letEndTime
            }       
        };
    }

    // Returns the latest LET end time before a given time point from an array of entity instances.
    getLatestLetEndTime(entityInstances, timePoint) {
        for (let entityIndex = entityInstances.length - 1; entityIndex > -1;  entityIndex--) {
            const entityInstance = entityInstances[entityIndex];
            if (entityInstance.letEndTime <= timePoint) {
                return entityInstance;
            }
        }
        
        return {
            'instance': -1,
            'periodStartTime': 0,
            'letStartTime': 0,
            'letEndTime': 0,
            'periodEndTime': 0
        }
    }

    // Create all instances of a dependency.
    createDependencyInstances(dependency, makespan) {
        // Get all instances of the source and destination entities
        // If one of the entities is Model.SystemInterfaceName, we use the timing of the entity for the Model.SystemInterfaceName
        return Promise.all([
            this.database.getObject(Model.EntityInstancesStoreName, dependency.source.entity), 
            this.database.getObject(Model.EntityInstancesStoreName, dependency.destination.entity)
        ]).then(([sourceEntityInstances, destinationEntityInstances]) => {
            let instances = [];
            if (dependency.source.entity == Model.SystemInterfaceName) {
                // Dependency is system input --> entity
                const destinationInstances = destinationEntityInstances ? destinationEntityInstances.value : 0;
                
                if (destinationInstances.length > 0) {
					const numberOfInstances = destinationInstances.length - (destinationInstances[destinationInstances.length - 1].letStartTime > makespan);
					for (let destinationIndex = numberOfInstances - 1; destinationIndex > -1;  destinationIndex--) {
						// Make the source index and instance of system input the same as the destination
						const destinationInstance = destinationInstances[destinationIndex];
						instances.unshift(this.createDependencyInstance(dependency, {instance: destinationInstance.instance, letEndTime: destinationInstance.letStartTime}, destinationInstance));
					}
                }
            } else if (dependency.destination.entity == Model.SystemInterfaceName) {
                // Dependency is entity --> system output
                const sourceInstances = sourceEntityInstances ? sourceEntityInstances.value : 0;
                
                if (sourceInstances.length > 0) {
					const numberOfInstances = sourceInstances.length - (sourceInstances[sourceInstances.length - 1].letEndTime > makespan);
					for (let sourceIndex = numberOfInstances - 1; sourceIndex > -1;  sourceIndex--) {
						// Make the destination index and instance of the system output the same as the source
						const sourceInstance = sourceInstances[sourceIndex];
						instances.unshift(this.createDependencyInstance(dependency, sourceInstance, {instance: sourceInstance.instance, letStartTime: sourceInstance.letEndTime}));
					}
                }
            } else {
                // Dependency is entity --> entity
                const sourceInstances = sourceEntityInstances ? sourceEntityInstances.value : 0;
                const destinationInstances = destinationEntityInstances ? destinationEntityInstances.value : 0;

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
            instances.sort(Utility.CompareDependencyInstanceByReceiveEvent);
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
    
    // TOOD: Extend to support SL-LET communication delays.
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

                const nextEventInstances = this.getSpecificDependencyInstances(dependencyInstances, segment, chainInstance.last.segment.receiveEvent.entityInstance);
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

    getSpecificDependencyInstances(dependencyInstances, dependency, entityInstance) {
        // Entity instance of currentEventInstance.receiveEvent and nextEventInstances.sendEvent have to match.
        return this.getDependencyInstances(dependencyInstances, dependency)
                   .filter(dependencyInstance => (dependencyInstance.sendEvent.entityInstance == entityInstance));
    }
    
    // Creates all event chains that go from the constraint's source port to its destination port.
    // Each event chain is linear with no branching.
    // Event chains are found via backwards reachability from the constraint's destination port.
    // Assumes that an entity's destination port can be reached by any of the entity's source ports.
    createInferredEventChains(allDependencies, name, source, destination) {
        const predecessorDependencies = this.getPredecessorDependencies(allDependencies, destination.entity);
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
                const predecessorDependencies = this.getPredecessorDependencies(allDependencies, chain.sourceEntity)
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

    getPredecessorDependencies(dependencies, entity) {
        return dependencies.filter(dependency => (dependency.destination.entity == entity));
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
    
    // Create all communication delay instances from all dependency instances.
    // All task-to-core/device allocations need to be known, which may require scheduling to be performed beforehand.
    createAllNetworkDelayInstances(executionTiming) {
        return Promise.all([
            this.modelDependency.getAllDependencies(),
            this.modelEntity.getAllEntitiesInstances()
        ]).then(async ([dependencies, entitiesInstances]) => {
            const filteredDependencies = dependencies.filter(dependency => 
                dependency.source.entity !== Model.SystemInterfaceName 
                && dependency.destination.entity !== Model.SystemInterfaceName);
            
            let instancesPromises = [ ];
            for (const dependency of filteredDependencies) {
                const sourceInstances = entitiesInstances.find(instances => instances.name == dependency.source.entity);
                const destinationInstances = entitiesInstances.find(instances => instances.name == dependency.destination.entity);

                let newDependencyValues = [ ];
                let encapsulationEntityInstances = [ ];
                let networkEntityInstances = [ ];
                let decapsulationEntityInstances = [ ];

                // Cache of the already generated encapsulation, network, and decapsulation delays.
                // Key: String representation of the source entity instance, source device, and destination device. See "cacheName".
                let cachedDelays = { };

                // For each destination entity instance, find the latest source entity instance whose output can arrive on time, taking
                // communication delays into account. Every pair of source-destination instance may have different combinations of communication delays.
                for (let destIndex = destinationInstances.value.length - 1; destIndex > -1; destIndex--) {
                    const destInstance = destinationInstances.value[destIndex];
                    let sourceInstanceCandidates = sourceInstances.value;
                    let sourceInstance = null;

                    let devicesAndNetworkDelay = null;
                    let sourceDevice = null;
                    let destDevice = null;
                    let networkDelay = null;
                    let encapsulationDelayTime = null;
                    let networkDelayTime = null;
                    let decapsulationDelayTime = null;
                    while (true) {
                        let oldSourceInstance = sourceInstance;
                        sourceInstance = this.getLatestLetEndTime(sourceInstanceCandidates, destInstance.letStartTime);

                        devicesAndNetworkDelay = await this.getDevicesAndNetworkDelay(sourceInstance.currentCore, destInstance.currentCore);
                        if (devicesAndNetworkDelay == null || oldSourceInstance == sourceInstance) {
                            break;
                        }
                        [sourceDevice, destDevice, networkDelay] = devicesAndNetworkDelay;

                        // For randomly generated delays, we need to cache the generated communication delays for each pair of source-destination entity instances
                        // in order to get consistent results when querying the same pair of entity instances.
                        const cacheName = `${sourceInstances.name}${sourceInstance.instance}_${sourceDevice.name}_${destDevice.name}`;
                        if (cachedDelays[cacheName] == undefined) {
                            cachedDelays[cacheName] = this.getDelays(sourceDevice, destDevice, networkDelay, executionTiming);
                        }
                        [encapsulationDelayTime, networkDelayTime, decapsulationDelayTime] = cachedDelays[cacheName];

                        const communicationDelay = encapsulationDelayTime + networkDelayTime + decapsulationDelayTime;
                        if (communicationDelay > (destInstance.letStartTime - sourceInstance.letEndTime)) {
                            sourceInstanceCandidates = sourceInstanceCandidates.slice(0, sourceInstance.instance);
                        }
                    }

                    if (devicesAndNetworkDelay) {
                        // Only create unique delay entities.
                        // Create dependencies that go through the network.
                    
                        const encapsulationEntityInstance = ModelEntity.CreateDelayEntityInstanceParameters(
                            encapsulationEntityInstances.length,
                            sourceInstance.letEndTime,
                            encapsulationDelayTime,
                            sourceDevice,
                            destDevice, 
                            dependency
                        );
                        if (!ModelSchedule.NetworkDelayInstanceIsDuplicate(encapsulationEntityInstances, encapsulationEntityInstance)) {
                            encapsulationEntityInstances.unshift(encapsulationEntityInstance);
                            const encapDependency = ModelDependency.CreateDelayDependencyParameters(dependency, ModelEntity.EncapsulationName);
                            newDependencyValues.unshift(this.createDependencyInstance(encapDependency, sourceInstance, encapsulationEntityInstances[0]));
                        }
                        
                        const networkEntityInstance = ModelEntity.CreateDelayEntityInstanceParameters(
                            networkEntityInstances.length,
                            encapsulationEntityInstances[0].letEndTime,
                            networkDelayTime,
                            sourceDevice,
                            destDevice, 
                            dependency
                        );
                        if (!ModelSchedule.NetworkDelayInstanceIsDuplicate(networkEntityInstances, networkEntityInstance)) {
                            networkEntityInstances.unshift(networkEntityInstance);
                            const networkDependency = ModelDependency.CreateDelayDependencyParameters(dependency, ModelEntity.NetworkName);
                            newDependencyValues.unshift(this.createDependencyInstance(networkDependency, encapsulationEntityInstances[0], networkEntityInstances[0]));
                        }

                        const decapsulationEntityInstance = ModelEntity.CreateDelayEntityInstanceParameters(
                            decapsulationEntityInstances.length,
                            networkEntityInstances[0].letEndTime,
                            decapsulationDelayTime,
                            sourceDevice,
                            destDevice, 
                            dependency
                        );
                        if (!ModelSchedule.NetworkDelayInstanceIsDuplicate(decapsulationEntityInstances, decapsulationEntityInstance)) {
                            decapsulationEntityInstances.unshift(decapsulationEntityInstance);
                            const decapDependency = ModelDependency.CreateDelayDependencyParameters(dependency, ModelEntity.DecapsulationName);
                            newDependencyValues.unshift(this.createDependencyInstance(decapDependency, networkEntityInstances[0], decapsulationEntityInstances[0]));
                        }

                        const destDependency = ModelDependency.CreateDelayDependencyParameters(dependency);
                        newDependencyValues.unshift(this.createDependencyInstance(destDependency, decapsulationEntityInstances[0], destInstance));
                    } else {
                        // Create dependency that doesn't go through the network.
                        newDependencyValues.unshift(this.createDependencyInstance(dependency, sourceInstance, destInstance));
                    }                        
                }

                encapsulationEntityInstances.sort(Utility.CompareEntityLetStartTime);
                encapsulationEntityInstances.forEach((instance, index) => instance.instance = index);
                networkEntityInstances.sort(Utility.CompareEntityLetStartTime);
                networkEntityInstances.forEach((instance, index) => instance.instance = index);
                decapsulationEntityInstances.sort(Utility.CompareEntityLetStartTime);
                decapsulationEntityInstances.forEach((instance, index) => instance.instance = index);
                
                instancesPromises.push(this.modelEntity.createAllDelayEntityInstances(dependency, encapsulationEntityInstances, networkEntityInstances, decapsulationEntityInstances));

                newDependencyValues.sort(Utility.CompareDependencyInstanceBySendAndReceiveEvents);
                newDependencyValues.forEach((instance, index) => instance.instance = index);
                
                const newDependencyInstances = this.database.putObject(Model.DependencyInstancesStoreName, {
                    'name': dependency.name, 
                    'value': newDependencyValues
                });
                instancesPromises.push(newDependencyInstances);
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
        return instances.find(instance =>
            instance.destinationDevice == other.destinationDevice
            && instance.sourceDevice == other.sourceDevice
            && instance.letStartTime == other.letStartTime
        ) != null;
    }

    getDelays(source, dest, network, executionTiming) {
        return [ModelSchedule.GetDelayTime(Object.values(source.delays)[0], executionTiming),
                ModelSchedule.GetDelayTime(network, executionTiming),
                ModelSchedule.GetDelayTime(Object.values(dest.delays)[0], executionTiming)];
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

    async getDevicesAndNetworkDelay(sourceCore, destCore) {
        if (destCore != null && sourceCore != null
                && destCore.device != null && sourceCore.device != null
                && destCore.device !== sourceCore.device) {
            const [sourceDevice, destDevice, networkDelay] = await Promise.all([
                this.modelDevice.getDevice(sourceCore.device),
                this.modelDevice.getDevice(destCore.device),
                this.modelNetworkDelay.getNetworkDelay(sourceCore.device, destCore.device)
            ]);

            let warnings = "";
            if (sourceDevice == null) warnings += `Device ${sourceCore.device} not found. `;
            if (destDevice == null) warnings += `Device ${destCore.device} not found. `;
            if (networkDelay == null) warnings += `Could not find a network delay from device ${sourceCore.device} to device ${destCore.device}.`;
            if (warnings !== "") {
                console.warn(warnings);
                return null;
            }

            return [sourceDevice, destDevice, networkDelay];
        }
        
        return null;
    }

    deleteSchedule() {
        // Delete all entity, dependency, and event chain instances.
        return this.database.deleteSchedule();
    }
    
    // Get task schedule for given makespan.
    getSchedule() {
        return {
            'promiseAllEntities': this.modelEntity.getAllEntities(),
            'promiseAllEntitiesInstances': this.modelEntity.getAllEntitiesInstances(),
            'promiseAllDependenciesInstances': this.modelDependency.getAllDependenciesInstances(),
            'promiseAllEventChainInstances': this.modelEventChain.getAllEventChainsInstances()
        };
    }
    
    toString() {
        return "ModelSchedule";
    }
}

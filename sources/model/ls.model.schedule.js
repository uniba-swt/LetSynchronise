'use strict';

class ModelSchedule {    
    database = null;

    modelEntity = null;
    modelDevice = null;
    modelCore = null;
    modelDependency = null;
    modelEventChain = null;
    modelConstraint = null;
    modelNetworkDelay = null;

    constructor() { }

    
    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }
    
    registerModelEntity(modelEntity) {
        this.modelEntity = modelEntity;
    }
    
    registerModelDevice(modelDevice) {
        this.modelDevice = modelDevice;
    }
    
    registerModelCore(modelCore) {
        this.modelCore = modelCore;
    }
    
    registerModelDevice(modelDevice) {
        this.modelDevice = modelDevice;
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

    registerModelNetworkDelay(modelNetworkDelay) {
        this.modelNetworkDelay = modelNetworkDelay;
    }
    
        
    // -----------------------------------------------------
    // Class methods

    // Create a single task instance.
    createTaskInstance(index, parameters, timePoint, executionTiming) {
        let executionTime = null;
        if (executionTiming === 'BCET') {
            executionTime = parameters.bcet;
        } else if (executionTiming === 'WCET') {
            executionTime = parameters.wcet;
        } else {
            executionTime = Utility.RandomInteger(parameters.bcet, parameters.acet, parameters.wcet, parameters.distribution);
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
            'value': instances,
            'executionTiming': executionTiming
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
    createDependencyInstance(dependency, sourceIndex, sourceInstance, destinationIndex, destinationInstance) {
        return {
            'instance': -1,
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
            this.database.getObject(Model.EntityInstancesStoreName, dependency.source.task), 
            this.database.getObject(Model.EntityInstancesStoreName, dependency.destination.task)
        ]).then(async ([sourceTaskInstances, destinationTaskInstances]) => {      
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
    
    // Create all instances of all dependencies.
    createAllDependencyInstances(makespan) {
        return this.modelDependency.getAllDependencies()
            .then(dependencies => Promise.all(dependencies.map(dependency => this.createDependencyInstances(dependency, makespan))));
    }
    
    // Creates all instances of an event chain from the given dependencyInstances.
    // Each event chain instance is linear with no branching.
    // Event chain instances are found via forward reachability from the event chain's starting dependency.
    createEventChainInstances(dependencyInstances, chain) {
        const filteredInstances = dependencyInstances.map(dependencyInstance => 
            dependencyInstance.value.filter(instance => 
                !instance.receiveEvent.task.includes("delay") && !instance.sendEvent.task.includes("delay")
            )
        );        
        
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
    createAllDependencyAndEventChainInstances(makespan) {
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
        this.createDelayRelatedInstances();

        return {
            'promiseAllTasks': this.modelEntity.getAllTasks(),
            'promiseAllTasksInstances': this.database.getAllObjects(Model.EntityInstancesStoreName),
            'promiseAllDependenciesInstances': this.modelDependency.getAllDependencyInstances(),
            'promiseAllEventChainInstances': this.modelEventChain.getAllEventChainsInstances()
        };
    }

    createDelayRelatedInstances() {
        Promise.all([this.modelDependency.getAllDependencyInstances(),this.modelDependency.getAllDependencies()])
        .then(async ([dependencyInstances, dependencies]) => {
            const filteredDependencies = dependencyInstances.map(dependency => ({
                ...dependency,
                value: dependency.value.filter(instance => 
                    instance.sendEvent.port !== 'SystemInput' && instance.receiveEvent.port !== 'SystemOutput')}))
            .filter(dependency => dependency.value.length > 0);
            
            for (const dependency of filteredDependencies) {
                let instances = [];
                const currentDependency = dependencies.find(item => dependency.name === item.name)

                if (dependency.value.length > 0) {
                    const sourceInstances = await this.database.getObject(Model.EntityInstancesStoreName, dependency.value[0].sendEvent.task);
                    const destInstances = await this.database.getObject(Model.EntityInstancesStoreName, dependency.value[0].receiveEvent.task);
                    const executionTiming = sourceInstances.executionTiming;
                    let encapsulationDelays = [], decapsulationDelays = [], networkDelays = [];

                    for (let destIndex = destInstances.value.length - 1; destIndex > -1; destIndex--) {
                        const destInstance = destInstances.value[destIndex];
                        let [sourceIndex, sourceInstance] = this.getLatestLetEndTime(sourceInstances.value, destInstance.letStartTime)
                        let result = await this.getDevicesAndNetworkDelay(sourceInstance, destInstance);
                        let sourceDevice = null, destDevice = null, networkDelay = null;

                        let flag = true;

                        while (flag) {
                            if (result) {
                                [sourceDevice, destDevice, networkDelay] = result;
                                const totalDelay = this.calculateTotalDelay(sourceDevice, destDevice, networkDelay, executionTiming)
    
                                let [newSourceIndex, newSourceInstance] = this.getLatestLetEndTime(sourceInstances.value, 
                                                                            destInstance.letStartTime - totalDelay);
                                
                                if (sourceIndex !== newSourceIndex) {
                                    result = await this.getDevicesAndNetworkDelay(sourceInstance, destInstance);
                                    sourceIndex = newSourceIndex;
                                    sourceInstance = newSourceInstance;
                                } else {
                                    flag = false;
                                }
                            } else {
                                flag = false;
                            }
                        }

                        if (result) {
                            encapsulationDelays.unshift(this.modelEntity.createDelayInstance(sourceInstance.letEndTime,
                                                        Utility.GetDelayTime(sourceDevice.delays[0], executionTiming),
                                                        sourceDevice, destDevice, currentDependency));
                            const encapDependency = this.modelDependency.createDelayDependency(currentDependency, sourceDevice, destDevice, 'encapsulation');
                            instances.unshift(this.createDependencyInstance(encapDependency, sourceIndex, sourceInstance, destIndex, encapsulationDelays[0]));
                            
                            networkDelays.unshift(this.modelEntity.createDelayInstance(encapsulationDelays[0].letEndTime,
                                                    Utility.GetDelayTime(networkDelay, executionTiming),
                                                    sourceDevice, destDevice, currentDependency));
                            const netDependency = this.modelDependency.createDelayDependency(currentDependency, sourceDevice, destDevice, 'network');
                            instances.unshift(this.createDependencyInstance(netDependency, sourceIndex, encapsulationDelays[0], destIndex, networkDelays[0]))

                            decapsulationDelays.unshift(this.modelEntity.createDelayInstance(networkDelays[0].letEndTime,
                                                        Utility.GetDelayTime(destDevice.delays[0], executionTiming),
                                                        sourceDevice, destDevice, currentDependency));
                            const decapDependency = this.modelDependency.createDelayDependency(currentDependency, sourceDevice, destDevice, 'decapsulation');
                            instances.unshift(this.createDependencyInstance(decapDependency, sourceIndex, networkDelays[0], destIndex, decapsulationDelays[0]));

                            const destDependency = this.modelDependency.createDelayDependency(currentDependency, sourceDevice);
                            instances.unshift(this.createDependencyInstance(destDependency, sourceIndex, decapsulationDelays[0], destIndex, destInstance));
                        } else {
                            instances.unshift(this.createDependencyInstance(currentDependency, sourceIndex, sourceInstance, destIndex, destInstance));
                        }                        
                    }

                    instances.sort((first, second) => {
                        const timestampComparison = first.sendEvent.timestamp - second.sendEvent.timestamp;
                        return timestampComparison === 0 ? first.receiveEvent.taskInstance - second.receiveEvent.taskInstance : timestampComparison;
                    });
        
                    instances.forEach((instance, index) => instance.instance = index);
                    
                    if (encapsulationDelays.length > 0 &&
                        networkDelays.length > 0 &&
                        decapsulationDelays.length > 0) {
                            encapsulationDelays.sort((first, second) => { first.letStartTime - second.letStartTime });
                            encapsulationDelays.forEach((instance, index) => instance.instance = index);
                            
                            networkDelays.sort((first, second) => { first.letStartTime - second.letStartTime });
                            networkDelays.forEach((instance, index) => instance.instance = index);

                            decapsulationDelays.sort((first, second) => { first.letStartTime - second.letStartTime });
                            decapsulationDelays.forEach((instance, index) => instance.instance = index);

                            this.modelEntity.createAllDelayInstances(currentDependency, 
                                encapsulationDelays, networkDelays, decapsulationDelays);
                    }
                    
                    this.database.putObject(Model.DependencyInstancesStoreName, {
                        'name': currentDependency.name,
                        'value': instances
                    })
                }
            }
        })
    }

    calculateTotalDelay(source, dest, network, executionTiming) {
        return Utility.GetDelayTime(source.delays[0], executionTiming) + 
                Utility.GetDelayTime(dest.delays[0], executionTiming) +
                Utility.GetDelayTime(network, executionTiming);
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

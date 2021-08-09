
'use strict';

class ModelAnalyse {
    updateAnalysis = null;    // Callback to function in ls.view.analyse
    
	database = null;

    modelTask = null;
    modelDependency = null;
    modelConstraint = null;
    
    constructor() { }

    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerAnalyseCallback(callback) {
        this.updateAnalysis = callback;
    }
    
    
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
    
    registerModelConstraint(modelConstraint) {
        this.modelConstraint = modelConstraint;
    }


    // -----------------------------------------------------
    // Class methods

	// Creates all event chains that go from the constraint's source port to its destination port.
	// Each event chain is linear with no branching.
	// Event chains are found via backwards reachability from the constraint's destination port. 
	// Assumes that a task's destination port can be reached by any of the task's source ports.
	createInferredEventChains(allDependencies, name, source, destination) {
		const predecessorDependencies = this.getPredecessorDependencies(allDependencies, destination.task);
		let eventChains = predecessorDependencies.map(dependency => new EventChain(dependency));
		
		let completeEventChains = [];
		while (eventChains.length) {
			let updatedEventChains = [];
			for (const eventChain of eventChains) {
				if (eventChain.startsWith(source)) {
					// Event chain is complete 
					completeEventChains.push({'name': `${name}:${completeEventChains.length}`, 'value': eventChain});
					continue;
				}

				// Event chain is still incomplete, so add predecessors.
				// Limitation: Ignore feedback loops.
				const predecessorDependencies = this.getPredecessorDependencies(allDependencies, eventChain.sourceTask)
				                                    .filter(predecessorDependency => !eventChain.includes(predecessorDependency));
				for (const predecessorDependency of predecessorDependencies) {
				   let newEventChain = new EventChain(predecessorDependency);
				   newEventChain.successor = eventChain;
				   updatedEventChains.push(newEventChain);
				}
			}
			
			eventChains = updatedEventChains;
		}
		
		Promise.all(completeEventChains.map((completeEventChain, index) => {
			this.database.putObject(Model.EventChainStoreName, completeEventChain);
		}));
	}

    getPredecessorDependencies(dependencies, task) {
        return dependencies.filter(dependency => (dependency.destination.task == task));
    }

    getSuccessorDependencies(dependencies, task) {
        return dependencies.filter(dependency => (dependency.source.task == task));
    }
    
    // Creates all instances of an event chain from the given dependencyInstances.
	// Each event chain instance is linear with no branching.
	// Event chain instances are found via forward reachability from the event chain's starting dependency.
    createEventChainInstances(dependencyInstances, eventChain) {
    	let nextSegment = eventChain.value.generator();
    	const startDependencies = this.getDependencyInstances(dependencyInstances, nextSegment.next().value);
    	let eventChainInstances = startDependencies.map(dependency => new EventChainInstance(eventChain.value.segment.name, dependency));
    	
    	for (const segment of nextSegment) {
    		let updatedEventChainInstances = [];
    		for (const eventChainInstance of eventChainInstances) {
		
				const nextEventInstances = this.getSpecificDependencyInstances(dependencyInstances, segment, eventChainInstance.last.segment.receiveEvent.taskInstance);
				for (const nextEventInstance of nextEventInstances) {
					let eventChainInstanceCopy = eventChainInstance.copy;
					eventChainInstanceCopy.last.successor = new EventChainInstance(segment.name, nextEventInstance);
					updatedEventChainInstances.push(eventChainInstanceCopy);
				}
			}
			
			eventChainInstances = updatedEventChainInstances;
    	}

		this.database.putObject(Model.EventChainInstancesStoreName, {
			'name': `${eventChain.name}`,
			'value': eventChainInstances
		});
    }

    getDependencyInstances(dependencyInstances, dependency) {
    	return dependencyInstances.filter(dependencyInstance => (dependencyInstance.name == dependency.name))
    	                          .flatMap(dependencyInstance => dependencyInstance.value);
    }
    
    getSpecificDependencyInstances(dependencyInstances, dependency, taskInstance) {     
        // Task instance of currentEventInstance.receiveEvent and nextEventInstances.sendEvent have to match.
        return this.getDependencyInstances(dependencyInstances, dependency)
                   .filter(dependencyInstance => (dependencyInstance.sendEvent.taskInstance == taskInstance));
    }

    getAnalyse() {
    	const promiseAllConstraints = this.modelConstraint.getAllConstraints();
    	const promiseAllDependencies = this.modelDependency.getAllDependencies();
    	const promiseAllDependencyInstances = this.modelDependency.getAllDependencyInstances();
    
    	// Get all constraints and all dependencies.
    	// Infer all event chains from each constraint, and store them in the model database.
    	// Retrieve the inferred event chains from the database, and transform them back into EventChain objects.
        const promiseAllInferredEventChains = Promise.all([promiseAllConstraints, promiseAllDependencies])
        	.then(([allConstraints, allDependencies]) => allConstraints
        		.forEach(constraint => this.createInferredEventChains(allDependencies, constraint.name, constraint.source, constraint.destination)))
        	.then(result => this.database.getAllObjects(Model.EventChainStoreName))
        	.then(allEventChains => allEventChains.map(eventChain => { 
        		return { 'name': eventChain.name, 'value': EventChain.FromJson(eventChain.value) }; 
        	}));

		// Get all event chains and all dependency instances.
		// Create all instances of each event chain, and store them in the model database.
		// Retrieve the event chain instances from the database, and transform them back into EventChainInstance objects.
		const promiseAllEventChainsInstances = Promise.all([promiseAllInferredEventChains, promiseAllDependencyInstances])
			.then(([allInferredEventChains, allDependencyInstances]) => allInferredEventChains
				.forEach(eventChain => this.createEventChainInstances(allDependencyInstances, eventChain)))
        	.then(result => this.database.getAllObjects(Model.EventChainInstancesStoreName))
        	.then(allEventChainsInstances => allEventChainsInstances.map(({ name: name, value: instances }) => {
        		return { 'name': name, 'value': instances.map(instance => EventChainInstance.FromJson(instance)) };
        	}));
        
        // Get all event chain instances, and compute the maximum latency of each instance.
        const promiseAllLatencies = promiseAllEventChainsInstances
        	.then(allEventChainsInstances => allEventChainsInstances.map(({ name: name, value: instances }) => {        	
				return { 'name': name, 'value': instances.map(instance => instance.maxLatency) };
			}));
		
		// Get all computed latencies and all constraints.
		// Evaluate each latency against its constraint.
		const promiseAllEvaluations = promiseAllLatencies
			.then(allLatencies => allLatencies.map(({ name: name, value: latencies }) => {
				const constraintName = name.split(':')[0];
				
				return this.modelConstraint.getConstraint(constraintName)
					.then(constraint => {
						return {
							'name': name, 
							'value': latencies.map(latency => {
								const expression = `${latency} ${constraint.relation} ${constraint.time}`;					
								const result = eval(expression);
								return `${expression} is ${result}`;
							})
						}
					});
			}));


        return promiseAllEvaluations;
    }

    toString() {
        return "ModelAnalyse";
    }
}

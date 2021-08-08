
'use strict';

class ModelAnalyse {
    updateAnalysis = null;    // Callback to function in ls.view.analyse
    
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
    
    registerModelTask(modelTask) {
        this.modelTask = modelTask;
    }

    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }
    
    registerModelConstraint(modelConstraint) {
        this.modelConstraint = modelConstraint;
    }


    getSourceDependencies(dependencies, task) {
        return dependencies.filter(dependency => (dependency.destination.task == task));
    }

    getDependencyInstanceEvents(dependencyInstances, dependency) {
    	return dependencyInstances.filter(dependencyInstance => (dependencyInstance.name == dependency.name))
    	                          .flatMap(dependencyInstance => dependencyInstance.value);
    }

    getNextDependencyInstanceEvents(path, dependencyInstances, currentEventInstance) {
        if (!path.successor) {
            return [];
        }
        
        let nextDependencyInstanceEvents = [];
		let nextEventInstances = this.getDependencyInstanceEvents(dependencyInstances, path.successor.segment);
		for (const nextEventInstance of nextEventInstances) {
			// Check if the current event instance is received by the same task that is making the 
			// next send event instance
			if (nextEventInstance.sendEvent.taskInstance == currentEventInstance.receiveEvent.taskInstance) {
				nextDependencyInstanceEvents.push({ path: path.successor, eventInstance: nextEventInstance });
			}
		}
        
        return nextDependencyInstanceEvents;
    }

    getLastSendEventTimeOfChain(path, dependencyInstances, eventInstance) {
        let nextEventInstances = this.getNextDependencyInstanceEvents(path, dependencyInstances, eventInstance);
        
        let lastSendEventTime = eventInstance.receiveEvent.timestamp;
        
        for (const { path: remainingPath, eventInstance: nextEventInstance } of nextEventInstances) {
        	let endTime = nextEventInstance.receiveEvent.timestamp;
            
            lastSendEventTime = Math.max(lastSendEventTime, endTime);
            
            endTime = this.getLastSendEventTimeOfChain(remainingPath, dependencyInstances, nextEventInstance);
            lastSendEventTime = Math.max(lastSendEventTime, endTime);
        }
        
        return lastSendEventTime;
    }

    getAnalyse() {
        return Promise.all([
			this.modelConstraint.getAllConstraints(),
			this.modelDependency.getAllDependencies(),
			this.modelDependency.getAllDependencyInstances()
        ]).then(([allConstraints, allDependencies, allDependencyInstances]) => {
			for (const constraint of allConstraints) {
				// Find all event chains that go from the constraint's source port to its destination port.
				// Event chains are found via backwards reachability from the destination port. Assumes that
				// a task's destination port can be reached by any of the task's source ports.
				console.log("Compute event chains");
				const sourceDependencies = this.getSourceDependencies(allDependencies, constraint.destination.task);
				let eventChains = sourceDependencies.map(dependency => new EventChain(dependency));
				
				let paths = [];
				while(eventChains.length > 0) {
					let updatedEventChains = [];
					for (const eventChain of eventChains) {
						if (eventChain.startsWith(constraint.source)) {
							// Event chain is complete 
							paths.push(eventChain);
							console.log("Chain: " + eventChain.toString());
						} else {
							// Event chain is still incomplete, so add predecessors
							const predecessorDependencies = this.getSourceDependencies(allDependencies, eventChain.sourceTask);
							for (const predecessorDependency of predecessorDependencies) {							
								// Limitation: Do not follow feedback loops
								if (!eventChain.includes(predecessorDependency)) {
									// Create copy of the current event chain and add the predecessor
									let newEventChain = new EventChain(predecessorDependency);
									newEventChain.successor = eventChain;
									updatedEventChains.push(newEventChain);
								}
							}
						}
					}
					
					console.log("iteration----");
					console.log(updatedEventChains);
					eventChains = updatedEventChains;
				}
				
				console.log("Paths");
				console.log(paths.toString());
				let maxDifference = -1;
				for (const path of paths) {
					let startEventInstances = this.getDependencyInstanceEvents(allDependencyInstances, path.segment);
					for (const startEventInstance of startEventInstances) {
						const startTime = startEventInstance.sendEvent.timestamp;
						
						const endTime = this.getLastSendEventTimeOfChain(path, allDependencyInstances, startEventInstance);
						maxDifference = Math.max(maxDifference, endTime - startTime);
						console.log("Start time: "+startTime+" End Time: "+endTime);
					
						// TODO: Ignore incomplete paths at the end of the makespan
					}
				}
				
				const evaluateString = `${maxDifference} ${constraint.relation} ${constraint.time}`;
				const constraintCompute = eval(evaluateString);
				console.log(`${constraint.name}: ${evaluateString} is ${constraintCompute}`);
				console.log("Longest path: " + maxDifference)
			}
		
			console.log("Analyse Model complete");
			return null;
        });
    }

    toString() {
        return "ModelAnalyse";
    }
}

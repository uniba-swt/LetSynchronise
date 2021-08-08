
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

    getNextDependencyInstanceEvents(eventChain, dependencyInstances, currentEventInstance) {
        if (!eventChain.successor) {
            return [];
        }
                
        // Task instance of currentEventInstance.receiveEvent and nextEventInstances.sendEvent have to match.
        const nextEventInstances = this.getDependencyInstanceEvents(dependencyInstances, eventChain.successor.segment);
        return nextEventInstances.filter(nextEventInstance => currentEventInstance.receiveEvent.taskInstance == nextEventInstance.sendEvent.taskInstance)
                                 .map(nextEventInstance => { return { eventChain: eventChain.successor, eventInstance: nextEventInstance } });
    }

    getEventChainEndTime(eventChain, dependencyInstances, eventInstance) {
        const nextEventInstances = this.getNextDependencyInstanceEvents(eventChain, dependencyInstances, eventInstance);
        if (!nextEventInstances.length && eventChain.successor) {
            // Event chain has a successor, but no next event could be found, e.g., due to makespan being too short.
            return null;
        }
        
        let lastSendEventTime = eventInstance.receiveEvent.timestamp;
        for (const { eventChain: remainingPath, eventInstance: nextEventInstance } of nextEventInstances) {
            const endTime = this.getEventChainEndTime(remainingPath, dependencyInstances, nextEventInstance);
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
        	let totalLatencies = { };

			for (const constraint of allConstraints) {
				// Find all event chains that go from the constraint's source port to its destination port.
				// Event chains are found via backwards reachability from the destination port. Assumes that
				// a task's destination port can be reached by any of the task's source ports.
				const sourceDependencies = this.getSourceDependencies(allDependencies, constraint.destination.task);
				let eventChains = sourceDependencies.map(dependency => new EventChain(dependency));
				
				let completeEventChains = [];
				while(eventChains.length) {
					let updatedEventChains = [];
					for (const eventChain of eventChains) {
						if (eventChain.startsWith(constraint.source)) {
							// Event chain is complete 
                            completeEventChains.push(eventChain);
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
					
					eventChains = updatedEventChains;
				}
				
                console.log(completeEventChains);
				console.log(completeEventChains.toString());

				totalLatencies[constraint.name] = { differences: [], maxDifference: -1, evaluation: null };
				let maxDifference = null;
				for (const eventChain of completeEventChains) {
					let startEventInstances = this.getDependencyInstanceEvents(allDependencyInstances, eventChain.segment);
					for (const startEventInstance of startEventInstances) {
						const startTime = startEventInstance.sendEvent.timestamp;
						
						const endTime = this.getEventChainEndTime(eventChain, allDependencyInstances, startEventInstance);
                        if (!endTime) {
                            continue;
                        }
                        
						maxDifference = Math.max(maxDifference, endTime - startTime);
						totalLatencies[constraint.name]["differences"].push(`${endTime} - ${startTime} = ${endTime - startTime}`);	
					}
				}

                totalLatencies[constraint.name]["maxDifference"] = maxDifference;

				const evaluateString = `${maxDifference} ${constraint.relation} ${constraint.time}`;
				const constraintCompute = eval(evaluateString);
				totalLatencies[constraint.name]["evaluation"] = `${evaluateString} is ${constraintCompute}`;
			}
		
			return totalLatencies;
        });
    }

    toString() {
        return "ModelAnalyse";
    }
}

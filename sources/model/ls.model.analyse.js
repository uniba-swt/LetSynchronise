
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


    getBasicSourceEventChains(dependencies, task) {
        return dependencies.filter(dependency => (dependency.destination.task == task))
                           .map(dependency => new EventChain(dependency));
    }

    getDependencyInstanceEvents(dependencyInstances, dependency) {
    	return dependencyInstances.filter(dependencyInstance => (dependencyInstance.name == dependency.name))
    	                          .flatMap(dependencyInstance => dependencyInstance.value);
    }

    getNextDependencyInstanceEvents(path, dependencyInstances, currentEventInstance) {
        let nextDependencyInstanceEvents = [];
        // A path should have zero or one child
        for (const child of path.children) {
            let nextEventInstances = this.getDependencyInstanceEvents(dependencyInstances, child.dependency);
            for (const nextEventInstance of nextEventInstances) {
            	// Check if the current event instance is received by the same task that is making the 
            	// next send event instance
                if (nextEventInstance.sendEvent.taskInstance == currentEventInstance.receiveEvent.taskInstance) {
                    nextDependencyInstanceEvents.push({ path: child, eventInstance: nextEventInstance });
                }
            }
        }
        
        return nextDependencyInstanceEvents;
    }

    getLastSendEventTimeOfChain(path, dependencyInstances, eventInstance) {
        let nextEventInstances = this.getNextDependencyInstanceEvents(path, dependencyInstances, eventInstance);
        
        let lastSendEventTime = (eventInstance.receiveEvent.task == Model.SystemInterfaceName)
                              ? eventInstance.sendEvent.timestamp
                              : eventInstance.receiveEvent.timestamp;
        
        for (const { path: remainingPath, eventInstance: nextEventInstance } of nextEventInstances) {
        	let endTime = (nextEventInstance.receiveEvent.task == Model.SystemInterfaceName)
        	            ? nextEventInstance.sendEvent.timestamp
        	            : nextEventInstance.receiveEvent.timestamp;
            
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
				console.log("Compute event chain");
				let paths = [];
				let eventChains = this.getBasicSourceEventChains(allDependencies, constraint.destination.task);
				
				// Replace with eventChain.buildCompleteChain(allDependencies, constraint.source, constraint.destination);
				while(eventChains.length > 0) {
					let eventChainsTemp = [];
					for (const eventChain of eventChains) {
						if (eventChain.startsWith(constraint.source)) {
							// Event chain is complete 
							paths.push(eventChain);
							console.log("Chain: " + eventChain.toString());
						} else {
							// Event chain is still incomplete, so add predecessors
							const predecessorBasicEventChains = this.getBasicSourceEventChains(allDependencies, eventChain.dependency.source.task);
							for (const predecessorBasicEventChain of predecessorBasicEventChains) {
								//prevent self loops
								if (eventChain.includes(predecessorBasicEventChain) == false) {
									predecessorBasicEventChain.addChild(eventChain);
									eventChainsTemp.push(predecessorBasicEventChain);
								}
							}
						}
					}
					
					console.log("iteration----");
					console.log(eventChainsTemp);
					eventChains = eventChainsTemp;
				}
				
				console.log("Paths");
				console.log(paths.toString());
				let maxDifference = -1;
				for (const path of paths) {
					let startEventInstances = this.getDependencyInstanceEvents(allDependencyInstances, path.dependency);
					for (const startEventInstance of startEventInstances) {
						let startTime = (startEventInstance.sendEvent.task == Model.SystemInterfaceName)
						              ? startEventInstance.receiveEvent.timestamp
						              : startEventInstance.sendEvent.timestamp;
						
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
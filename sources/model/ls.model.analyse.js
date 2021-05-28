
'use strict';

class ModelAnalyse {
    updateAnalysis = null;    // Callback to function in ls.view.analyse
    
    modelDependency = null;
    modelConstraint = null;
    modelTask = null;
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

    getTaskSourceDependenciesInChainNodes(dependencies, port) {
        let sourceDependenciesChainNodes = [];
        for (const dependency of dependencies) {
            if (dependency.destination.task == port.task) { 
                sourceDependenciesChainNodes.push(new ChainNode(dependency))
            }
        }
        return sourceDependenciesChainNodes;
    }

    getDependencyEventInstances(dependencyInstances, dependency) {
        for (const instanceType of dependencyInstances) {
            if (instanceType.name == dependency.name) {
                return instanceType.value;
            }
        }
        return [];
    }

    getNextDependencyInstance(path, dependencyInstances, eventInstance){
        let resultInstances = [];
        /*console.log("getNextDependencyInstance");
        console.log(path);
        console.log(eventInstance);*/
        for (const child of path.children) {
            let childDependencyEventInstances = this.getDependencyEventInstances(dependencyInstances, child.dependency)
            for (const childEventInstance of childDependencyEventInstances) {
                if (childEventInstance.sendEvent.taskInstance == eventInstance.receiveEvent.taskInstance) {
                    resultInstances.push({node : child, eventInstance : childEventInstance});
                }
            }
        }
        
        return resultInstances;
    }

    getLastSendEventTimeOfChain(path, dependencyInstances, eventInstance) {
        //console.log("getLastSendEventTimeOfChain");
        let nextInstances = this.getNextDependencyInstance(path, dependencyInstances, eventInstance);
        
        let lastSendEventTime
        if (eventInstance.receiveEvent.task == "__system") {
        	lastSendEventTime = eventInstance.sendEvent.timestamp
        } else {
        	lastSendEventTime = eventInstance.receiveEvent.timestamp
        }
        
        for (const nextInstance of nextInstances) {
            /*console.log("getLastSendEventTimeOfChain2");
            console.log(nextInstance);*/
            
        	let endTime
			if (nextInstance.eventInstance.receiveEvent.task == "__system") {
				endTime = nextInstance.eventInstance.sendEvent.timestamp
			} else {
				endTime = nextInstance.eventInstance.receiveEvent.timestamp
			}
            
            if (lastSendEventTime < endTime) {
                lastSendEventTime = endTime;
            }
            let result = this.getLastSendEventTimeOfChain(nextInstance.node, dependencyInstances, nextInstance.eventInstance);
            if (lastSendEventTime < result) {
                lastSendEventTime = result;
            }
        }
        return lastSendEventTime;
    }

    async analyse() {
        let tasks = await this.modelTask.getAllTasks();
        let constraints = await this.modelConstraint.getAllConstraints();
        let dependencies = await this.modelDependency.getAllDependencies();
        let taskInstances = await this.modelTask.getAllTaskInstances();
        let dependencyInstances = await this.modelDependency.getAllDependencyInstances();
        /*console.log("Analyse Model begin");
        console.log(tasks);
        console.log(constraints);
        console.log(dependencies);
        console.log("instances");
        console.log(taskInstances);
        console.log(dependencyInstances);*/
        
        /*hardcoded chain for testing and development*/
        //let chain = new ChainNode(dependencies[0]);
        //let child = chain.addChildrenDependency(dependencies[1]).addChildrenDependency(dependencies[2]);
        //console.log(chain.toString());
        for (const constraint of constraints) {
            /*let name = constraint["name"];
            let source = constraint["source"];
            let destination = constraint["destination"];
            let relation = constraint["relation"];
            let time = constraint["time"];*/
            //console.log(name+" source:"+source.task+"."+source.port+" destination:"+destination.task+"."+destination.port+" relation:"+relation+" time:"+time);
            
            /*find paths to source*/
            console.log("Compute chain");
            let paths = [];
            let sourceDependenciesChainNodes = this.getTaskSourceDependenciesInChainNodes(dependencies, constraint.destination);

            while(sourceDependenciesChainNodes.length > 0) {
                let sourceDependenciesChainNodesTemp = [];
                for (let i = 0; i < sourceDependenciesChainNodes.length; i++) {
                    const sourceDependencyChainNode = sourceDependenciesChainNodes[i];
                    console.log("Chain: "+sourceDependencyChainNode.toString());

					if (sourceDependencyChainNode.dependency.source.task == constraint.source.task && sourceDependencyChainNode.dependency.source.port == constraint.source.port) {
						paths.push(sourceDependencyChainNode);
					} else {
						/*The source nodes of the current chain node*/
						let result = this.getTaskSourceDependenciesInChainNodes(dependencies, sourceDependencyChainNode.dependency.source);
						for (let j = 0; j < result.length; j++) {
							let parentChainNode = result[j];
							//prevent self loops
							if (sourceDependencyChainNode.contains(parentChainNode)==false) {
								parentChainNode.addChildren(sourceDependencyChainNode);
								sourceDependenciesChainNodesTemp.push(parentChainNode);
// 								if (parentChainNode.dependency.source.task == constraint.source.task && parentChainNode.dependency.source.port == constraint.source.port) {
// 									paths.push(parentChainNode);
// 								}
							}
						}
					}
                }
                console.log("iteration----");
                console.log(sourceDependenciesChainNodesTemp);
                sourceDependenciesChainNodes = sourceDependenciesChainNodesTemp;
            }
            console.log("Paths");
            console.log(paths.toString());
            let maxDifference = -1;
            for (const path of paths) {
                let eventInstances = this.getDependencyEventInstances(dependencyInstances, path.dependency);
                for (const eventInstance of eventInstances) {
                	// Only true if the event is from a system
                	let startTime = -1
                	if (eventInstance.sendEvent.task == "__system") {
                		startTime = eventInstance.receiveEvent.timestamp;
                	} else {
	                    startTime = eventInstance.sendEvent.timestamp;
                	}
                    //console.log("Entering");
                    let endTime = this.getLastSendEventTimeOfChain(path, dependencyInstances, eventInstance);
                    console.log("Start time: "+startTime+" End Time: "+endTime);
                    if (endTime - startTime > maxDifference) {
                        maxDifference = endTime-startTime;
                    }
                    
                    // TODO: Ignore incomplete paths at the end of the makespan
                }
            }
            let evalulateString = ""+maxDifference + constraint.relation + constraint.time;
            let constraintCompute = eval(evalulateString);
            console.log("eval: " +maxDifference + constraint.relation + constraint.time);
            console.log(constraint.name + " is " + constraintCompute);
            console.log("longest path: "+maxDifference)
        }
        
        this.updateAnalysis();
        console.log("Analyse Model complete");
    }

    toString() {
        return "ModelAnalyse";
    }
}
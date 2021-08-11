
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

    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
    }

    // -----------------------------------------------------
    // Class methods

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
        
        return Promise.all(completeChains.map(completeChain => this.modelEventChain.createEventChain(completeChain)));
    }

    getPredecessorDependencies(dependencies, task) {
        return dependencies.filter(dependency => (dependency.destination.task == task));
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

    getAnalyse() {
		const promiseAllEventChains = this.modelEventChain.getAllEventChains();
        const promiseAllConstraints = this.modelConstraint.getAllConstraints();
        const promiseAllDependencyInstances = this.modelDependency.getAllDependencyInstances();
            
//         // Get all constraints and all dependencies.
//         // Infer all event chains from each constraint, and store them in the model database.
//         // Retrieve the inferred event chains from the database, and transform them back into Chain objects.
//         const promiseAllDependencies = this.modelDependency.getAllDependencies();
//         const promiseAllInferredEventChains = Promise.all([promiseAllConstraints, promiseAllDependencies])
//             .then(([allConstraints, allDependencies]) => allConstraints
//                 .forEach(constraint => this.createInferredEventChains(allDependencies, constraint.name, constraint.source, constraint.destination)))
//             .then(result => this.modelEventChain.getAllEventChains())


        // Get all event chains and all dependency instances.
        // Create all instances of each event chain, and store them in the model database.
        // Retrieve the event chain instances from the database, and transform them back into ChainInstance objects.
        const promiseAllEventChainInstances = Promise.all([promiseAllEventChains, promiseAllDependencyInstances])
            .then(([allEventChains, allDependencyInstances]) => allEventChains
                .forEach(chain => this.createEventChainInstances(allDependencyInstances, chain)))
            .then(result => this.modelEventChain.getAllEventChainsInstances())
        
        // Get all constraints and all event chain instances.
        // Collect all the event chain instances of each constraint, and compute their maxLatency.
        const promiseAllEvaluations = Promise.all([promiseAllConstraints, promiseAllEventChainInstances])
            .then(([allConstraints, allChainInstances]) => {
                let chainsLatencies = { };
                allChainInstances.forEach(chainInstance => { chainsLatencies[chainInstance.chainName] = [] });
                allChainInstances.forEach(chainInstance => { chainsLatencies[chainInstance.chainName].push(chainInstance.maxLatency) });

                let results = { };
                for (const constraint of allConstraints) {              
                    for (const chainName in chainsLatencies) {
                        if (chainName == constraint.eventChain) {
                            results[chainName] = {
                                'min': Math.min(...chainsLatencies[chainName]),
                                'max': Math.max(...chainsLatencies[chainName]),
                                'eval': chainsLatencies[chainName].map(latency => {
                                    const expression = `${latency} ${constraint.relation} ${constraint.time}`;                  
                                    const result = eval(expression);
                                    return `${expression} is ${result}`;
                                })
                            };
                        }
                    }
                        
                }
                return results;
            });

        return promiseAllEvaluations;
    }

    toString() {
        return "ModelAnalyse";
    }
}

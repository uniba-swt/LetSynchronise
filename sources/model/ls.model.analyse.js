
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
                    eventChain.name = `${name}:${completeEventChains.length}`;
                    completeEventChains.push(eventChain);
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
            this.database.putObject(Model.EventChainStoreName, completeEventChain.json);
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
        let nextSegment = eventChain.generator();
        const startDependencies = this.getDependencyInstances(dependencyInstances, nextSegment.next().value);
        let eventChainInstances = startDependencies.map(dependency => new EventChainInstance(eventChain.name, dependency));
        
        for (const segment of nextSegment) {
            let updatedEventChainInstances = [];
            for (const eventChainInstance of eventChainInstances) {
        
                const nextEventInstances = this.getSpecificDependencyInstances(dependencyInstances, segment, eventChainInstance.last.segment.receiveEvent.taskInstance);
                for (const nextEventInstance of nextEventInstances) {
                    let eventChainInstanceCopy = eventChainInstance.copy;
                    eventChainInstanceCopy.last.successor = new EventChainInstance(null, nextEventInstance);
                    updatedEventChainInstances.push(eventChainInstanceCopy);
                }
            }
            
            eventChainInstances = updatedEventChainInstances;
        }
        
        Promise.all(eventChainInstances.map((eventChainInstance, index) => {
            eventChainInstance.name = `${eventChainInstance.name}:${index}`;
            this.database.putObject(Model.EventChainInstanceStoreName, eventChainInstance.json);
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
        const promiseDeleteEventChains = this.database.deleteAllObjects(Model.EventChainStoreName);
        const promiseDeleteEventChainInstances = this.database.deleteAllObjects(Model.EventChainInstanceStoreName);
        const promiseDeleteDatabase = Promise.all([promiseDeleteEventChains, promiseDeleteEventChainInstances]);

        const promiseAllConstraints = this.modelConstraint.getAllConstraints();
        const promiseAllDependencies = this.modelDependency.getAllDependencies();
        const promiseAllDependencyInstances = this.modelDependency.getAllDependencyInstances();
            
        // Get all constraints and all dependencies.
        // Infer all event chains from each constraint, and store them in the model database.
        // Retrieve the inferred event chains from the database, and transform them back into EventChain objects.
        const promiseAllInferredEventChains = Promise.all([promiseAllConstraints, promiseAllDependencies, promiseDeleteDatabase])
            .then(([allConstraints, allDependencies, _]) => allConstraints
                .forEach(constraint => this.createInferredEventChains(allDependencies, constraint.name, constraint.source, constraint.destination)))
            .then(result => this.database.getAllObjects(Model.EventChainStoreName))
            .then(allEventChains => allEventChains.map(eventChain => EventChain.FromJson(eventChain)));

        // Get all event chains and all dependency instances.
        // Create all instances of each event chain, and store them in the model database.
        // Retrieve the event chain instances from the database, and transform them back into EventChainInstance objects.
        const promiseAllEventChainInstances = Promise.all([promiseAllInferredEventChains, promiseAllDependencyInstances])
            .then(([allInferredEventChains, allDependencyInstances]) => allInferredEventChains
                .forEach(eventChain => this.createEventChainInstances(allDependencyInstances, eventChain)))
            .then(result => this.database.getAllObjects(Model.EventChainInstanceStoreName))
            .then(allEventChainInstances => allEventChainInstances.map(eventChainInstance => EventChainInstance.FromJson(eventChainInstance)));
        
        // Get all constraints and all event chain instances.
        // Collect all the event chain instances of each constraint, and compute their maxLatency.
        const promiseAllEvaluations = Promise.all([promiseAllConstraints, promiseAllEventChainInstances])
            .then(([allConstraints, allEventChainInstances]) => {
                let eventChainsLatencies = { };
                allEventChainInstances.forEach(eventChainInstance => { eventChainsLatencies[eventChainInstance.eventChainName] = [] });
                allEventChainInstances.forEach(eventChainInstance => { eventChainsLatencies[eventChainInstance.eventChainName].push(eventChainInstance.maxLatency) });

                let results = { };
                for (const constraint of allConstraints) {              
                    for (const eventChainName in eventChainsLatencies) {
                        if (eventChainName.split(':')[0] == constraint.name) {
                            results[eventChainName] = {
                                'min': Math.min(...eventChainsLatencies[eventChainName]),
                                'max': Math.max(...eventChainsLatencies[eventChainName]),
                                'eval': eventChainsLatencies[eventChainName].map(latency => {
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

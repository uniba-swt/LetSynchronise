'use strict';

class ModelEventChain {
    updateEventChains = null;                       // Callback to function in ls.view.eventChain
    updateEventChainSelectors = null;               // Callback to function in ls.view.eventChain
    
    database = null;
    modelDependency = null;
    modelConstraint = null;
    
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateEventChainsCallback(callback) {
        this.updateEventChains = callback;
    }
    
    registerUpdateEventChainSelectorsCallback(callback) {
        this.updateEventChainSelectors = callback;
    }

    
    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }
    
    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }
    
    registerModelConstraint(modelConstraint) {
        this.modelConstraint = modelConstraint;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    createEventChain(eventChain) {
        // Store event chain into Database
        return this.database.putObject(Model.EventChainStoreName, eventChain.json)
            .then(this.refreshViews());
    }
    
    createEventChainFromNames(eventChainRaw) {
        return this.modelDependency.getAllDependencies()
            .then(allDependencies => {
                let eventChain = null;
                
                for (const dependencyName of eventChainRaw.dependencies) {
                    for (const dependency of allDependencies) {
                        if (dependency.name == dependencyName) {
                            if (!eventChain) {
                                eventChain = new Chain(dependency);
                                eventChain.name = eventChainRaw.name;
                            } else {
                                const successor = new Chain(dependency);
                                eventChain.last.successor = successor;
                            }
                            break;
                        }
                    }
                }
            
                return this.createEventChain(eventChain);
            });     
    }
    
    getAllEventChains() {
        return this.database.getAllObjects(Model.EventChainStoreName)
            .then(allEventChains => allEventChains.map(eventChain => Chain.FromJson(eventChain)));
    }
    
    getEventChain(name) {
        return this.database.getObject(Model.EventChainStoreName, name)
            .then(eventChain => Chain.FromJson(eventChain));
    }

    deleteEventChain(name) {
        const promiseDeleteEventChainInstances = this.deleteEventChainInstances(name);
        const promiseDeleteEventChain = this.database.deleteObject(Model.EventChainStoreName, name);

        return Promise.all([promiseDeleteEventChain, promiseDeleteEventChainInstances])
            .then(this.refreshViews());
    }
    
    deleteAllEventChains() {
        return this.database.deleteAllObjects(Model.EventChainStoreName)
            .then(this.database.deleteAllObjects(Model.EventChainInstanceStoreName))
            .then(this.refreshViews());
    }
    
    createEventChainInstance(eventChainInstance) {
        // Store event chain instance into Database
        return this.database.putObject(Model.EventChainInstanceStoreName, eventChainInstance.json);
    }
    
    getAllEventChainsInstances() {
        return this.database.getAllObjects(Model.EventChainInstanceStoreName)
            .then(allEventChainInstances => allEventChainInstances.map(eventChainInstance => ChainInstance.FromJson(eventChainInstance)));
    }

    // Deletes all instances of a given event chain
    deleteEventChainInstances(name) {
        return this.getAllEventChainsInstances()
            .then(allEventChainInstances => allEventChainInstances.filter(eventChainInstance => (eventChainInstance.chainName == name)))
            .then(instancesToDelete => Promise.all(
                instancesToDelete.map(instance => this.database.deleteObject(Model.EventChainInstanceStoreName, instance.name))
            ));
    }
    
    deleteAllEventChainsInstances() {
        return this.database.deleteAllObjects(Model.EventChainInstanceStoreName);
    }

    deleteEventChainsOfTask(taskName) {
        return this.getAllEventChains()
            .then(eventChains => {
                let deletePromises = [];
                for (const eventChain of eventChains) {
                    for (const segment of eventChain.generator()) {
                        if (segment.destination.task == taskName || segment.source.task == taskName) {
                            deletePromises.push(this.deleteEventChain(eventChain.name));
                            deletePromises.push(this.modelConstraint.deleteConstraintsOfEventChain(eventChain.name));
                            break;
                        }
                    }
                }
                
                return Promise.all(deletePromises);
            });
    }
    
    deleteEventChainsOfSystem(portName) {
        return this.getAllEventChains()
            .then(eventChains => {
                let deletePromises = [];
                for (const eventChain of eventChains) {
                    for (const segment of eventChain.generator()) {
                        if ((segment.destination.task == Model.SystemInterfaceName || segment.source.task == Model.SystemInterfaceName)
                                && (segment.destination.port == portName || segment.source.port == portName)) {
                            deletePromises.push(this.deleteEventChain(eventChain.name));
                            deletePromises.push(this.modelConstraint.deleteConstraintsOfEventChain(eventChain.name));
                            break;
                        }
                    }
                }
                
                return Promise.all(deletePromises);
            });
    }
    
    deleteEventChainsOfDependency(dependencyName) {
        return this.getAllEventChains()
            .then(eventChains => {
                let deletePromises = [];
                for (const eventChain of eventChains) {
                    for (const segment of eventChain.generator()) {
                        if (segment.name == dependencyName) {
                            deletePromises.push(this.deleteEventChain(eventChain.name));
                            deletePromises.push(this.modelConstraint.deleteConstraintsOfEventChain(eventChain.name));
                            break;
                        }
                    }
                }
                
                return Promise.all(deletePromises);
            });
    }

    synchroniseWithDependencies(dependencies) {        
        return this.getAllEventChains()
            .then(allEventChains => allEventChains.forEach(eventChain => {
                for (const segment of eventChain.segments) {
                    if (!dependencies.some(dependency => (dependency.name == segment.name))) {
                        this.deleteEventChain(eventChain.name);
                        break;
                    }
                }
            }))
            .then(this.refreshViews());
    }
    
    refreshViews() {
        return this.getAllEventChains()
            .then(result => this.updateEventChains(result))
            .then(result => this.modelDependency.getAllDependencies())
            .then(result => this.updateEventChainSelectors(result));

    }
    
    toString() {
        return "ModelEventChain";
    }
}

'use strict';

class ModelDependency {
    updateDependencies = null;      // Callback to function in ls.view.dependency
    updateDependencySelectors = null;
    
    database = null;
    modelTask = null;
    modelInterface = null;
    modelEventChain = null;

    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateDependenciesCallback(callback) {
        this.updateDependencies = callback;
    }

    registerUpdateDependencySelectorsCallback(callback) {
        this.updateDependencySelectors = callback;
    }
        

    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }
    
    registerModelTask(modelTask) {
        this.modelTask = modelTask;
    }
    
    registerModelInterface(modelInterface) {
        this.modelInterface = modelInterface;
    }

    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
    }
        
    
    // -----------------------------------------------------
    // Class methods

    createDependency(dependency) {
        // Store dependency in Database
        return this.database.putObject(Model.DependencyStoreName, dependency)
            .then(this.refreshViews());
    }
    
    getDependency(name) {
        return this.database.getObject(Model.DependencyStoreName, name);
    }
    
    getAllDependencies() {
        return this.database.getAllObjects(Model.DependencyStoreName);
    }
    
    getAllDependencyInstances() {
        return this.database.getAllObjects(Model.DependencyInstancesStoreName);
    }

    
    deleteDependency(name) {
        return this.database.deleteObject(Model.DependencyInstancesStoreName, name)
            .then(this.database.deleteObject(Model.DependencyStoreName, name))
            .then(this.modelEventChain.deleteEventChainsOfDependency(name))
            .then(this.refreshViews());
    }
    
    deleteAllDependencies() {
        return this.database.deleteAllObjects(Model.DependencyInstancesStoreName)
            .then(this.database.deleteAllObjects(Model.DependencyStoreName))
            .then(this.refreshViews());
    }
    
    deleteDependenciesOfTask(taskName) {
        return this.getAllDependencies()
            .then(dependencies => Promise.all(
                dependencies.filter(dependency => (dependency.destination.task == taskName || dependency.source.task == taskName))
                    .map(dependency => this.deleteDependency(dependency.name))
            ));
    }
    
    deleteDependenciesOfSystem(portName) {
        return this.getAllDependencies()
            .then(dependencies => Promise.all(
                dependencies.filter(dependency => ((dependency.destination.task == Model.SystemInterfaceName || dependency.source.task == Model.SystemInterfaceName)
                        && (dependency.destination.port == portName || dependency.source.port == portName)))
                    .map(dependency => this.deleteDependency(dependency.name))
            ));
    }
    
    getSuccessorDependencies(name) {
        const promiseDependency = this.getDependency(name);
        const promiseAllDependencies = promiseDependency.then(sourceDependency => {
            return (sourceDependency.destination.task == Model.SystemInterfaceName) ? [] : this.getAllDependencies();
        });
        
        return Promise.all([promiseDependency, promiseAllDependencies])
            .then(([sourceDependency, allDependencies]) => allDependencies
                .filter(dependency => (dependency.source.task == sourceDependency.destination.task)));
    }

    refreshViews() {
        return this.getAllDependencies()
            .then(result => { this.updateDependencies(result); this.modelEventChain.synchroniseWithDependencies(result); })
            .then(result => Promise.all([this.modelTask.getAllTasks(), this.modelInterface.getAllInputs(), this.modelInterface.getAllOutputs()]))
            .then(([tasks, systemInputs, systemOutputs]) => this.updateDependencySelectors(tasks, systemInputs, systemOutputs));
    }

    toString() {
        return "ModelDependency";
    }
}

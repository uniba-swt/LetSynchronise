'use strict';

class ModelDependency {
    updateDependencies = null;      // Callback to function in ls.view.dependency
    updateDependencySelectors = null;
    
    database = null;
    modelTask = null;
    modelInterface = null;

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
    
    
    // -----------------------------------------------------
    // Class methods

    createDependency(dependency) {
        // Store dependency in Database
        return this.database.putObject(Model.DependencyStoreName, dependency)
            .then(this.refreshViews());
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
            .then(this.refreshViews());
    }
    
    deleteAllDependencies() {
        return this.database.deleteAllObjects(Model.DependencyInstancesStoreName)
            .then(this.database.deleteAllObjects(Model.DependencyStoreName))
            .then(this.refreshViews());
    }
    
    deleteDependenciesOfTask(taskName) {
        return this.getAllDependencies()
            .then(dependencies => {
                let deletePromises = [];
                for (const dependency of dependencies) {
                    if (dependency.destination.task == taskName || dependency.source.task == taskName) {
                        deletePromises.push(this.deleteDependency(dependency.name));
                    }
                }
                
                return Promise.all(deletePromises);
            });
    }
    
    deleteDependenciesOfSystem(portName) {
        return this.getAllDependencies()
            .then(dependencies => {
                let deletePromises = [];
                for (const dependency of dependencies) {
                    if (dependency.destination.task == Model.SystemInterfaceName || dependency.source.task == Model.SystemInterfaceName) {
                        if (dependency.destination.port == portName || dependency.source.port == portName) {
                            deletePromises.push(this.deleteDependency(dependency.name));
                        }
                    }
                }
                
                return Promise.all(deletePromises);
            });
    }

    refreshViews() {
        return this.getAllDependencies()
            .then(result => this.updateDependencies(result))
            .then(result => Promise.all([this.modelTask.getAllTasks(), this.modelInterface.getAllInputs(), this.modelInterface.getAllOutputs()]))
            .then(([tasks, systemInputs, systemOutputs]) => this.updateDependencySelectors(tasks, systemInputs, systemOutputs));
    }

    toString() {
        return "ModelDependency";
    }
}

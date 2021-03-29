'use strict';

class ModelDependency {
    updateDependencies = null;      // Callback to function in ls.view.dependency
    database = null;

    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateDependenciesCallback(callback) {
        this.updateDependencies = callback;
    }
    
    
    // -----------------------------------------------------
    // Registration of model database
    registerModelDatabase(database) {
        this.database = database;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    createDependency(dependency) {
        // Store dependency in Database
        this.database.storeDependency(dependency)
        	.then(result => this.getAllDependencies())
        	.then(result => this.updateDependencies(result));
    }
    
    getAllDependencies() {
        return this.database.getAllDependencies();
    }
    
    deleteDependency(name) {
        this.database.deleteDependency(name)
        	.then(this.database.deleteDependencyInstances(name))
        	.then(result => this.getAllDependencies())
        	.then(result => this.updateDependencies(result));
    }
    
    toString() {
        return "ModelDependency";
    }
}

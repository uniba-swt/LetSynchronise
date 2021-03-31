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
        return this.database.storeDependency(dependency)
        	.then(this.refreshViews());
    }
    
    getAllDependencies() {
        return this.database.getAllDependencies();
    }
    
    deleteDependency(name) {
        return this.database.deleteDependency(name)
        	.then(this.database.deleteDependencyInstances(name))
        	.then(result => this.refreshViews());
    }
    
    deleteAllDependencies() {
    	return this.database.deleteAllDependencies()
    		.then(this.database.deleteAllDependenciesInstances())
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

    refreshViews() {
    	return this.getAllDependencies()
    		.then(result => this.updateDependencies(result));
    }
    
    toString() {
        return "ModelDependency";
    }
}

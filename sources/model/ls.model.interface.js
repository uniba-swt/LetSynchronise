'use strict';

class ModelInterface {
    updateInterface = null;      // Callback to function in ls.view.interface
    
    database = null;
    modelDependency = null;
    modelConstraint = null;

    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateInterfaceCallback(callback) {
        this.updateInterface = callback;
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

    createInput(name) {
        // Store input in Database
        return this.database.putObject(Model.SystemInputStoreName, name)
        	.then(this.refreshViews());
    }
    
    createOutput(name) {
        // Store input in Database
        return this.database.putObject(Model.SystemOutputStoreName, name)
        	.then(this.refreshViews());
    }
    
    getAllInputs() {
        return this.database.getAllObjects(Model.SystemInputStoreName);
    }
    
    getAllOutputs() {
        return this.database.getAllObjects(Model.SystemOutputStoreName);
    }
    
    deleteInput(name) {
		return this.modelDependency.deleteDependenciesOfSystem(name)
			.then(this.modelConstraint.deleteConstraintsOfSystem(name))
        	.then(this.database.deleteObject(Model.SystemInputStoreName, name))
        	.then(this.refreshViews());
    }
    
    deleteOutput(name) {
		return this.modelDependency.deleteDependenciesOfSystem(name)
			.then(this.modelConstraint.deleteConstraintsOfSystem(name))
        	.then(this.database.deleteObject(Model.SystemOutputStoreName, name))
        	.then(this.refreshViews());
    }

    refreshViews() {
    	return Promise.all([this.getAllInputs(), this.getAllOutputs()])
        	.then(([inputs, outputs]) => this.updateInterface(inputs, outputs))
    }
    
    toString() {
        return "ModelInterface";
    }
}

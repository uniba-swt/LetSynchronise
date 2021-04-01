'use strict';

class ModelInterface {
    updateInterface = null;      // Callback to function in ls.view.interface
    
    database = null;

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
    
    
    // -----------------------------------------------------
    // Class methods

    createInput(name) {
        // Store input in Database
        return this.database.storeInput(name)
        	.then(this.refreshViews());
    }
    
    createOutput(name) {
        // Store input in Database
        return this.database.storeOutput(name)
        	.then(this.refreshViews());
    }
    
    getAllInputs() {
        return this.database.getAllInputs();
    }
    
    getAllOutputs() {
        return this.database.getAllOutputs();
    }
    
    deleteInput(name) {
        return this.database.deleteInput(name)
        	.then(this.refreshViews());
    }
    
    deleteOutput(name) {
        return this.database.deleteOutput(name)
        	.then(this.refreshViews());
    }
    
    deleteAllInputs() {
    	return this.database.deleteAllInputs()
    		.then(this.refreshViews());
    }
    
    deleteAllOutputs() {
    	return this.database.deleteAllOutputs()
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

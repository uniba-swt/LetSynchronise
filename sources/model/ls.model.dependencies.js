'use strict';

class ModelDependencies {
    updateDependencies = null;      // Callback to function in ls.view.task
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
    
    getAllDependencies(callbacks) {
    //    this.database.getAllDependencies(this.updateDependencies);
        const dummyDependencies = [{'input': 't1.in1', 'output': 't3.out1'}, {'input': 't1.in2', 'output': 't3.out2'}];

        callbacks.forEach(callback => callback(dummyDependencies));
    }
    
    createDependency(dependency) {
        // Store dependencies into Database
    //    const logicalDependency = ModelLogicalDependency.CreateWithDependency(dependency);
    //    this.database.storeDependency(this.updateDependencies, logicalDependency);
        console.log(`Created dependency: ${JSON.stringify(dependency)}`);
        const callbacks = [this.updateDependencies];
        this.getAllDependencies(callbacks);
    }
    
    
    toString() {
        return "ModelDependencies";
    }
}

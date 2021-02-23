'use strict';

class ModelConstraints {
    updateConstraints = null;      // Callback to function in ls.view.constraints
    database = null;

    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateConstraintsCallback(callback) {
        this.updateConstraints = callback;
    }
    
    
    // -----------------------------------------------------
    // Registration of model database
    registerModelDatabase(database) {
        this.database = database;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    createConstraint(constraint) {
        // Store constraint into Database
        //    const constraint = ModelConstraint.CreateWithConstraint(constraint);
        //    this.database.storeConstraint(this.updateConstraints, constraint);
        alert(`Created constraint: ${JSON.stringify(constraint)}`);
        const callbacks = [this.updateConstraints];
        this.getAllConstraints(callbacks);
    }
    
    deleteConstraint(name) {
        alert(`Delete constraint ${name}`);
        
        const callbacks = [this.updateConstraints];
        this.getAllConstraints(callbacks);
    }
    
    getAllConstraints(callbacks) {
    //    this.database.getAllConstraints(callbacks);
        
        // TODO: Destination and Source values could be a string "task.port" or "task" and "port" separately.
        const dummyConstraints = [
            {
                'name': 'sensorConstraint',
                'destination': 't1.in1',
                'source': 't3.out1',
                'relation': '<',
                'time': '20'
                
            },
            {
                'name': 'actuatorConstraint',
                'destination': 't1.in2',
                'source': 't3.out2',
                'relation': '<=',
                'time': '15]'
                
            }
        ];
        callbacks.forEach(callback => callback(dummyConstraints));
    }
    
    toString() {
        return "ModelConstraints";
    }
}

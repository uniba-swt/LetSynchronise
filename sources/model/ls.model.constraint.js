'use strict';

class ModelConstraint {
    updateConstraints = null;      // Callback to function in ls.view.constraint
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
        // const constraint = ModelConstraint.CreateWithConstraint(constraint);
        // this.database.storeConstraint(constraint)
        //	.then(result => this.getAllConstraints())
        //  .then(result => this.updateConstraints(result));
        alert(`Created constraint: ${JSON.stringify(constraint)}`);
        this.getAllConstraints()
            .then(result => this.updateConstraints(result));
    }
    
    deleteConstraint(name) {
        alert(`Delete constraint ${name}`);
        
        this.getAllConstraints()
            .then(result => this.updateConstraints(result));
    }
    
    getAllConstraints(callbacks) {
    //    return this.database.getAllConstraints()
    //        .then(result = { return result } );
        
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
                'time': '15'
            }
        ];

        return new Promise((resolve, reject) => { resolve(dummyConstraints) });
    }
    
    toString() {
        return "ModelConstraints";
    }
}

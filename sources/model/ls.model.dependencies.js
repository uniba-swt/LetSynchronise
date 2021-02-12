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

    create(dependency) {
        // Store dependencies into Database
        //    const logicalDependency = ModelLogicalDependency.CreateWithDependency(dependency);
        //    this.database.storeDependency(this.updateDependencies, logicalDependency);
        console.log(`Created dependency: ${JSON.stringify(dependency)}`);
        const callbacks = [this.updateDependencies];
        this.getAllLogical(callbacks);
    }
    
    getAllLogical(callbacks) {
    //    this.database.getAllDependencies(this.updateDependencies);
        
        const dummyDependencies = [{'name': 'sensorDataflow', 'destination': 't1.in1', 'source': 't3.out1'}, {'name': 'actuatorDataflow', 'destination': 't1.in2', 'source': 't3.out2'}];
        callbacks.forEach(callback => callback(dummyDependencies));
    }
    
    getAllInstances() {
        const dummyDataflows = [
            {
                'id': 1,                      // ID of dataflow instance
                'name': 'sensorDataflow',     // Original name of dependency
                'receiveEvent': {
                    'destination': 't1.in1',  // Original destination of dependency
                    'instance': 3,            // Instance of destination task (1 indexing)
                    'timestamp': 4            // Timestamp of receive event (LET start of task's instance)
                },
                'sendEvent': {
                    'source': 't3.out1',      // Original source of dependency
                    'instance': 1,            // Instance of source task (1 indexing)
                    'timestamp': 3.2          // Timestamp of send event (LET end of task's instance)
                }
            },
            {
                'id': 2,
                'name': 'actuatorDataflow',
                'receiveEvent': {
                    'destination': 't1.in2',
                    'instance': 3,
                    'timestamp': 4
                },
                'sendEvent': {
                    'source': 't3.out2',
                    'instance': 1,
                    'timestamp': 3.2
                }
            },
            {
                'id': 3,
                'name': 'actuatorDataflow',
                'receiveEvent': {
                    'destination': 't1.in2',
                    'instance': 4,
                    'timestamp': 6
                },
                'sendEvent': {
                    'source': 't3.out2',
                    'instance': 2,
                    'timestamp': 5.7
                }
            },
            {
                'id': 4,
                'name': 'actuatorDataflow',
                'receiveEvent': {
                    'destination': 't1.in2',
                    'instance': 5,
                    'timestamp': 8
                },
                'sendEvent': {
                    'source': 't3.out2',
                    'instance': 2,
                    'timestamp': 5.7
                }
            }
        ];

        return dummyDataflows
    }
    
    toString() {
        return "ModelDependencies";
    }
}

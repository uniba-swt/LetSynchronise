'use strict';

class ModelDependencies {
    updateDependencies = null;      // Callback to function in ls.view.dependencies
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
        // Store dependencies into Database
        //    const logicalDependency = ModelLogicalDependency.CreateWithDependency(dependency);
        //this.database.storeDependency(this.updateDependencies, logicalDependency);
        this.database.storeDependency(dependency);
        const callbacks = [this.updateDependencies];
        this.getAllDependencyDefinitions(callbacks);
    }
    /*
    deleteUpdateCallback() {
        //console.log(this.updateDependencies);
        //this.updateDependencies is not in the scope of the callback
        const callbacks = [this.updateDependencies];
        this.getAllDependencyDefinitions(callbacks);
    }
    */
    deleteDependency(name) {
        const callbacks = [this.getAllDependencyDefinitions.bind(this)];
        const args = [this.updateDependencies];
        this.database.deleteDependency(callbacks, args, name);
    }
    
    getAllDependencyDefinitions(callbacks) {
        this.database.getAllDependenciesFormatted(callbacks);
    }
    
    getAllDependencyInstances() {
        //alert(`Get getAllDependencyInstances ${name}`);
        const dummyDataflows = [
            {
                'id': 1,                      // ID of dataflow instance
                'name': 'sensorDataflow',     // Original name of dependency
                'receiveEvent': {
                    'port': 't1.in1',         // Original destination of dependency
                    'taskInstance': 3,        // Instance of destination task (1 indexing)
                    'timestamp': 4            // Timestamp of receive event (LET start of task's instance)
                },
                'sendEvent': {
                    'port': 't3.out1',        // Original source of dependency
                    'taskInstance': 1,        // Instance of source task (1 indexing)
                    'timestamp': 3.2          // Timestamp of send event (LET end of task's instance)
                }
            },
            {
                'id': 2,
                'name': 'actuatorDataflow',
                'receiveEvent': {
                    'port': 't1.in2',
                    'taskInstance': 3,
                    'timestamp': 4
                },
                'sendEvent': {
                    'port': 't3.out2',
                    'taskInstance': 1,
                    'timestamp': 3.2
                }
            },
            {
                'id': 3,
                'name': 'actuatorDataflow',
                'receiveEvent': {
                    'port': 't1.in2',
                    'taskInstance': 4,
                    'timestamp': 6
                },
                'sendEvent': {
                    'port': 't3.out2',
                    'taskInstance': 2,
                    'timestamp': 5.7
                }
            },
            {
                'id': 4,
                'name': 'actuatorDataflow',
                'receiveEvent': {
                    'port': 't1.in2',
                    'taskInstance': 5,
                    'timestamp': 8
                },
                'sendEvent': {
                    'port': 't3.out2',
                    'taskInstance': 2,
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

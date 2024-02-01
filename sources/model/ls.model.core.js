'use strict';

class ModelCore {
    updateCores = null;                 // Callback to function in ls.view.core
    notifyChanges = null;               // Callback to function in ls.view.schedule

    database = null;
    modeltask = null;

    constructor() { }
    
    static get Default() { return {'name': 'Default', 'speedup': 1}; }
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateCoresCallback(callback) {
        this.updateCores = callback;
    }
    
    registerNotifyChangesCallback(callback) {
        this.notifyChanges = callback;
    }
    

    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }

    registerModelTask(modelTask) {
        this.modelTask = modelTask;
    }
    
    // -----------------------------------------------------
    // Class methods
    
    createCore(core) {
        // Store core in Database
        return this.database.putObject(Model.CoreStoreName, core)
            .then(this.refreshViews())
            .then(this.notifyChanges());
    }
    
    getCore(name) {
        return this.database.getObject(Model.CoreStoreName, name)
            .catch(error => {
                // Return the default core parameters
                return this.database.getAllObjects(Model.CoreStoreName)
                    .then(cores => {
                        let defaultCore = ModelCore.Default;
                        if (cores.length != 0) {
                            const slowestCore = cores.reduce((min, current) => (min.speedup < current.speedup) ? min : current);
                            defaultCore.speedup = slowestCore.speedup;
                        }
                        return defaultCore;
                    });
            });
    }

    getAllCores() {
        return this.database.getAllObjects(Model.CoreStoreName);
    }
    
    deleteCore(name) {
        return this.database.deleteObject(Model.CoreStoreName, name)
            .then(this.refreshViews());
    }
    
    refreshViews() {
        return this.getAllCores()
            .then(result => this.updateCores(result))
            .then(result => this.modelTask.validate());
    }
    
    toString() {
        return "ModelCore";
    }
}

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
            .catch(error => ModelCore.Default);
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

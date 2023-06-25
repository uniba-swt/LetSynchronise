'use strict';

class ModelCore {
    updateCores = null;                 // Callback to function in ls.view.core

    database = null;

    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateCoresCallback(callback) {
        this.updateCores = callback;
    }
    

    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }

    
    // -----------------------------------------------------
    // Class methods
    
    createCore(core) {
        // Store core in Database
        return this.database.putObject(Model.CoreStoreName, core)
            .then(this.refreshViews());
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
            .then(result => this.updateCores(result));
    }
    
    toString() {
        return "ModelCore";
    }
}

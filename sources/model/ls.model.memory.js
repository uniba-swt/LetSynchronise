'use strict';

class ModelMemory {
    updateMemories = null;                // Callback to function in ls.view.memory

    database = null;

    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateMemoriesCallback(callback) {
        this.updateMemories = callback;
    }
    
    
    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }

    
    // -----------------------------------------------------
    // Class methods
    
    createMemory(memory) {
        // Store memory in Database
        return this.database.putObject(Model.MemoryStoreName, memory)
            .then(this.refreshViews());
    }
    
    getAllMemories() {
        return this.database.getAllObjects(Model.MemoryStoreName);
    }
    
    deleteMemory(name) {
        return this.database.deleteObject(Model.MemoryStoreName, name)
            .then(this.refreshViews());
    }
    
    refreshViews() {
        return this.getAllMemories()
            .then(result => this.updateMemories(result));
    }
    
    toString() {
        return "ModelMemory";
    }
}

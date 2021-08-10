'use strict';

class ModelExportImport {
    database = null;
    
    modelTask = null;
    modelDependency = null;
    modelConstraint = null;
    modelInterface = null;
    
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of models
    
    registerModelDatabase(database) {
        this.database = database;
    }

    registerModelInterface(modelInterface) {
        this.modelInterface = modelInterface;
    }

    registerModelTask(modelTask) {
        this.modelTask = modelTask;
    }
    
    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }
    
     registerModelConstraint(modelConstraint) {
        this.modelConstraint = modelConstraint;
    }
    
    
    // -----------------------------------------------------
    // Class methods
    
    resetSystem() {
        this.database.deleteSystem()
            .then(this.refreshViews());
    }

    exportSystem() {
        this.database.exportSystem()
            .then(system => {
                const json = JSON.stringify(system);
                const link = document.createElement("a");
                const file = new Blob([json], { type: 'application/json' });
                link.href = URL.createObjectURL(file);
                link.download = 'system.json';
                link.click();
                URL.revokeObjectURL(link.href);
            });
    }

    importSystem(system) {
        this.database.deleteSystem()
            .then(this.database.importSystem(system))
            .then(this.refreshViews());
    }
    
    refreshViews() {
        return this.modelInterface.refreshViews()
            .then(this.modelTask.refreshViews())
            .then(this.modelDependency.refreshViews())
            .then(this.modelConstraint.refreshViews())
    }
    
    
    toString() {
        return "ModelExportImport";
    }

    
}

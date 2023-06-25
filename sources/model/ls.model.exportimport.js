'use strict';

class ModelExportImport {
    database = null;
    
    modelCore = null;
    modelMemory = null;
    modelInterface = null;
    modelTask = null;
    modelDependency = null;
    modelEventChain = null;
    modelConstraint = null;
    
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of models
    
    registerModelDatabase(database) {
        this.database = database;
    }
    
    registerModelCore(modelCore) {
        this.modelCore = modelCore;
    }
    
    registerModelMemory(modelMemory) {
        this.modelMemory = modelMemory;
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
        
    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
    }
    
     registerModelConstraint(modelConstraint) {
        this.modelConstraint = modelConstraint;
    }


    // -----------------------------------------------------
    // Class methods
    
    resetSystem(elementsSelected) {
        this.database.deleteSystem(elementsSelected)
            .then(this.refreshViews());
    }

    exportSystem(elementsSelected, PluginExporter) {
        PluginExporter.Result(elementsSelected)
            .then(json => {
                const link = document.createElement("a");
                const file = new Blob([json], { type: 'application/json' });
                link.href = URL.createObjectURL(file);
                link.download = 'system.json';
                link.click();
                URL.revokeObjectURL(link.href);
            });
    }

    importSystem(system, elementsSelected) {
        this.database.deleteSystem(elementsSelected)
            .then(this.database.importSystem(system, elementsSelected))
            .then(this.refreshViews());
    }
    
    refreshViews() {
        return this.modelInterface.refreshViews()
            .then(this.modelTask.refreshViews());
    }
    
    
    toString() {
        return "ModelExportImport";
    }

    
}

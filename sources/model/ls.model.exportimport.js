'use strict';

class ModelExportImport {
    database = null;
    modelTask = null;
    modelDependency = null;
    
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of models
    
    registerModelDatabase(database) {
        this.database = database;
    }

    registerModelTask(modelTask) {
        this.modelTask = modelTask;
    }
    
    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    exportSystem() {
        this.database.exportSystemJson()
        	.then(result => {
				const link = document.createElement("a");
				const file = new Blob([result], { type: 'application/json' });
				link.href = URL.createObjectURL(file);
				link.download = 'system.json';
				link.click();
			});
    }

    importSystem(system) {
        this.database.importSystem(system)
        	.then(Promise.all([this.modelTask.refreshViews(), this.modelDependency.refreshViews()]));
    }
    
    toString() {
        return "ModelExportImport";
    }

    
}

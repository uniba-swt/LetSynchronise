'use strict';

class ModelExportImport {
    database = null;
    
    modelTask = null;
    modelDependency = null;
    modelInterface = null;
    
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
    
    registerModelInterface(modelInterface) {
        this.modelInterface = modelInterface;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    exportSystem() {
        this.database.exportSystem()
            .then(result => JSON.stringify(result))
        	.then(result => {
				const link = document.createElement("a");
				const file = new Blob([result], { type: 'application/json' });
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
    	return this.modelTask.refreshViews()
    		.then(this.modelDependency.refreshViews())
    		.then(this.modelInterface.refreshViews())
    }
    
    
    toString() {
        return "ModelExportImport";
    }

    
}

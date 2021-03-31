'use strict';

class ModelExportImport {
//    updateTasks = null;                 // Callback to function in ls.view.task
//    updateDependencySelectors = null;   // Callback to function in ls.view.dependency
//    updateConstraintSelectors = null;   // Callback to function in ls.view.constraint

    database = null;
    modelTask = null;
    modelDependency = null;
    
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
/*
    registerUpdateTasksCallback(callback) {
        this.updateTasks = callback;
    }
    
    registerUpdateDependencySelectorsCallback(callback) {
        this.updateDependencySelectors = callback;
    }
    
    registerUpdateConstraintSelectorsCallback(callback) {
        this.updateConstraintSelectors = callback;
    }
    */
    
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

    importSystem(system) {
        this.database.importSystem(system)
        	.then(Promise.all([this.modelTask.refreshViews(), this.modelDependency.refreshViews()]));
    }

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
    
    toString() {
        return "ModelExportImport";
    }

    
}

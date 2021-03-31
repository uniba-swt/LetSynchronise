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
    	this.modelTask.deleteAllTasks()
    		.then(this.modelDependency.deleteAllDependencies())
    		.then(() => {
				let importPromises = []
				for (const task of system.Tasks) {
					importPromises.push(this.modelTask.createTask(task));
				}

				for (const dependency of system.Dependencies) {
					importPromises.push(this.modelDependency.createDependency(dependency));
				}
				
				return Promise.all(importPromises);
    		
    		})
        	.then(Promise.all([this.modelTask.refreshViews(), this.modelDependency.refreshViews()]));
    }
    
    toString() {
        return "ModelExportImport";
    }

    
}

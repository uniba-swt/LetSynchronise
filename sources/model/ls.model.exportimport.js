'use strict';

class ModelExportImport {
    database = null;
    
    modelTask = null;
    modelDependency = null;
    modelConstraint = null;
    modelInterface = null;
    modelEventChain = null;
    
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
    
    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
    }
    
    
    // -----------------------------------------------------
    // Class methods
    
    resetSystem(elementsSelected) {
        this.database.deleteSystem(elementsSelected)
            .then(this.refreshViews());
    }

    exportSystem(elementsSelected) {
        this.database.exportSystem(elementsSelected)
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

    importSystem(system, elementsSelected) {
        this.database.deleteSystem(elementsSelected)
            .then(this.database.importSystem(system, elementsSelected))
            .then(this.refreshViews());
    }
    
//    exportSchedule(schedule) {
//        this.database.exportSchedule()
//            .then(system => {
//                const json = JSON.stringify(system);
//                const link = document.createElement("a");
//                const file = new Blob([json], { type: 'application/json' });
//                link.href = URL.createObjectURL(file);
//                link.download = 'schedule.json';
//                link.click();
//                URL.revokeObjectURL(link.href);
//            });
//    }
    
    // Importing a schedule first clears the instance stores that the schedule will define.
//    importSchedule(schedule) {
//        this.database.deleteSchedule(Object.keys(schedule))
//            .then(this.database.importSchedule(schedule))
//            .then(this.refreshViews());
//    }
    
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

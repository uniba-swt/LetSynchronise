'use strict';

class Model {
    modelTask = null;
    modelDependencies = null;
    modelSchedule = null;
    
    constructor() { }
    
    set modelTask(modelTask) {
        this.modelTask;
    }
    
    set modelDependencies(modelDependencies) {
        this.modelDependencies = modelDependencies;
    }
    
    set modelSchedule(modelSchedule) {
        this.modelSchedule = modelSchedule;
    }
    
    get modelTask() {
        return this.modelTask;
    }
    
    get modelDependencies() {
        return this.modelDependencies;
    }
    
    get modelSchedule() {
        return this.modelSchedule;
    }
    
    toString() {
    	return "Model";
    }
}

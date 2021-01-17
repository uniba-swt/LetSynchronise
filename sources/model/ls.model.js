'use strict';

class Model {
    _modelTask = null;
    _modelDependencies = null;
    _modelSchedule = null;
    _modelDatabase = null;
    
    constructor() { }
    
    get modelTask() {
        return this._modelTask;
    }
    
    set modelTask(modelTask) {
        this._modelTask = modelTask;
    }
    
    get modelDependencies() {
        return this._modelDependencies;
    }
    
    set modelDependencies(modelDependencies) {
        this._modelDependencies = modelDependencies;
    }
    
    get modelSchedule() {
        return this._modelSchedule;
    }
    
    set modelSchedule(modelSchedule) {
        this._modelSchedule = modelSchedule;
    }
    
    get modelDatabase() {
        return this._modelDatabase;
    }
    
    set modelDatabase(modelDatabase) {
        this._modelDatabase = modelDatabase;
        this._modelTask.registerModelDatabase(this.modelDatabase);
    }
    
    toString() {
    	return "Model";
    }
}

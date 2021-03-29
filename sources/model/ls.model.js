'use strict';

class Model {
    _modelTask = null;
    _modelDependency = null;
    _modelSchedule = null;
    _modelConstraint = null;
    _modelDatabase = null;
    
    constructor() { }
    
    get modelTask() {
        this._modelTask.registerModelDependency(this._modelDependency);
        return this._modelTask;
    }
    
    set modelTask(modelTask) {
        this._modelTask = modelTask;
    }
    
    get modelDependency() {
        return this._modelDependency;
    }
    
    set modelDependency(modelDependency) {
        this._modelDependency = modelDependency;
    }
    
    get modelSchedule() {
        return this._modelSchedule;
    }
    
    set modelSchedule(modelSchedule) {
        this._modelSchedule = modelSchedule;
    }
    
    get modelConstraint() {
        return this._modelConstraint;
    }
    
    set modelConstraint(modelConstraint) {
        this._modelConstraint = modelConstraint;
    }
    
    get modelDatabase() {
        return this._modelDatabase;
    }
    
    set modelDatabase(modelDatabase) {
        this._modelDatabase = modelDatabase;
        this._modelTask.registerModelDatabase(this._modelDatabase);
        this._modelSchedule.registerModelDatabase(this._modelDatabase);
        this._modelDependency.registerModelDatabase(this._modelDatabase);
        this._modelConstraint.registerModelDatabase(this._modelDatabase);
    }
    
    toString() {
    	return "Model";
    }
}

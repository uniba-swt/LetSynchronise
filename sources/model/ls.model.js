'use strict';

class Model {
    _modelExportImport = null;
    _modelInterface = null;
    _modelTask = null;
    _modelDependency = null;
    _modelSchedule = null;
    _modelConstraint = null;
    _modelDatabase = null;
    
    constructor() { }

    get modelExportImport() {
        return this._modelExportImport;
    }
    
    set modelExportImport(modelExportImport) {
        this._modelExportImport = modelExportImport;
    }
    
    get modelInterface() {
        return this._modelInterface;
    }
    
    set modelInterface(modelInterface) {
        this._modelInterface = modelInterface;
    }
    
    get modelTask() {
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
        this._modelExportImport.registerModelDatabase(this._modelDatabase);
        this._modelInterface.registerModelDatabase(this._modelDatabase);
        this._modelTask.registerModelDatabase(this._modelDatabase);
        this._modelSchedule.registerModelDatabase(this._modelDatabase);
        this._modelDependency.registerModelDatabase(this._modelDatabase);
        this._modelConstraint.registerModelDatabase(this._modelDatabase);
    }
    
    toString() {
        return "Model";
    }
}

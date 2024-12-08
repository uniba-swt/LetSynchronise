'use strict';

class Model {
    _modelExportImport = null;
    _modelCore = null;
    _modelMemory = null;
    _modelInterface = null;
    _modelEntity = null;
    _modelDependency = null;
    _modelSchedule = null;
    _modelEventChain = null;
    _modelConstraint = null;
    _modelAnalyse = null;
    _modelDatabase = null;
    
    constructor() { }
    
    // -----------------------------------------------------
    // Static constants.

    static get CoreStoreName()                { return 'CoreStore'; }
    static get MemoryStoreName()              { return 'MemoryStore'; }
    static get SystemInputStoreName()         { return 'SystemInputStore'; }
    static get SystemOutputStoreName()        { return 'SystemOutputStore'; }
    static get EntityStoreName()                { return 'EntityStore'; }
    static get EntityInstancesStoreName()       { return 'EntityInstancesStore'; }
    static get DependencyStoreName()          { return 'DependencyStore'; }
    static get DependencyInstancesStoreName() { return 'DependencyInstancesStore'; }
    static get EventChainStoreName()          { return 'EventChainStore'; }
    static get EventChainInstanceStoreName()  { return 'EventChainInstanceStore'; }
    static get ConstraintStoreName()          { return 'ConstraintStore'; }
    static get ConstraintInstancesStoreName() { return 'ConstraintInstancesStore'; }
    
    static get ShortStoreNames() {
        return [
            'cores',
            'memories',
            'inputs',
            'outputs',
            'tasks',
            'dependencies',
            'eventChains',
            'constraints',
            'schedule'
        ];
    }
    
    static get SystemInterfaceName()          { return '__system'; }


    get modelExportImport() {
        return this._modelExportImport;
    }
    
    set modelExportImport(modelExportImport) {
        this._modelExportImport = modelExportImport;
    }
    
    get modelCore() {
        return this._modelCore;
    }
    
    set modelCore(modelCore) {
        this._modelCore = modelCore;
    }

    get modelMemory() {
        return this._modelMemory;
    }
    
    set modelMemory(modelMemory) {
        this._modelMemory = modelMemory;
    }

    get modelInterface() {
        return this._modelInterface;
    }
    
    set modelInterface(modelInterface) {
        this._modelInterface = modelInterface;
    }
    
    get modelEntity() {
        return this._modelEntity;
    }
    
    set modelEntity(modelEntity) {
        this._modelEntity = modelEntity;
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

    get modelEventChain() {
        return this._modelEventChain;
    }
    
    set modelEventChain(modelEventChain) {
        this._modelEventChain = modelEventChain;
    }

    get modelAnalyse() {
        return this._modelAnalyse;
    }

    set modelAnalyse(modelAnalyse) {
        this._modelAnalyse = modelAnalyse;
    }

    get modelDatabase() {
        return this._modelDatabase;
    }
    
    set modelDatabase(modelDatabase) {
        this._modelDatabase = modelDatabase;
        this._modelExportImport.registerModelDatabase(this._modelDatabase);
        this._modelCore.registerModelDatabase(this._modelDatabase);
        this._modelMemory.registerModelDatabase(this._modelDatabase);
        this._modelInterface.registerModelDatabase(this._modelDatabase);
        this._modelEntity.registerModelDatabase(this._modelDatabase);
        this._modelSchedule.registerModelDatabase(this._modelDatabase);
        this._modelDependency.registerModelDatabase(this._modelDatabase);
        this._modelEventChain.registerModelDatabase(this._modelDatabase);
        this._modelConstraint.registerModelDatabase(this._modelDatabase);
        this._modelAnalyse.registerModelDatabase(this._modelDatabase);
    }
    
    toString() {
        return "Model";
    }
}

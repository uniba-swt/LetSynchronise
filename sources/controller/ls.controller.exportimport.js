'use strict';

class ControllerExportImport {
    _view = null;
    _model = null;
    _modelCore = null;
    _modelMemory = null;
    _modelInterface = null;
    _modelTask = null;
    _modelDependency = null;
    _modelEventChain = null;
    _modelConstraint = null;
    
    constructor() { }
    
    set view(view) {
        this._view = view;

        // Register the handlers when setting the view.
        this._view.registerExportSystemButtonHandler(this.handleExportSystem);
        this._view.registerImportSystemButtonHandler(this.handleImportSystem);
        this._view.registerResetSystemButtonHandler(this.handleResetSystem);
    }
    
    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
    }
    
    get model() {
        return this._model;
    }
    
    set modelInterface(modelInterface) {
        this._modelInterface = modelInterface;
        
        // Register the model interface with the model.
        this._model.registerModelInterface(this._modelInterface);
    }
    
    get modelCore() {
        return this._modelCore;
    }
    
    set modelCore(modelCore) {
        this._modelCore = modelCore;
        
        // Register the model core with the model.
        this._model.registerModelCore(this._modelCore);
    }
    
    get modelMemory() {
        return this._modelMemory;
    }
    
    set modelMemory(modelMemory) {
        this._modelMemory = modelMemory;
        
        // Register the model memory with the model.
        this._model.registerModelMemory(this._modelMemory);
    }
    
    get modelInterface() {
        return this._modelInterface;
    }
    
    set modelTask(modelTask) {
        this._modelTask = modelTask;
        
        // Register the model task with the model.
        this._model.registerModelTask(this._modelTask);
    }
    
    get modelTask() {
        return this._modelTask;
    }
    
    set modelDependency(modelDependency) {
        this._modelDependency = modelDependency;
        
        // Register the model dependency with the model.
        this._model.registerModelDependency(this._modelDependency);
    }
    
    get modelDependency() {
        return this._modelDependency;
    }
    
    set modelEventChain(modelEventChain) {
        this._modelEventChain = modelEventChain;
        
        // Register the model event chain with the model.
        this._model.registerModelEventChain(this._modelEventChain);
    }
    
    get modelEventChain() {
        return this._modelEventChain;
    }
    
    set modelConstraint(modelConstraint) {
        this._modelConstraint = modelConstraint;
        
        // Register the model constraint with the model.
        this._model.registerModelConstraint(this._modelConstraint);
    }
    
    get modelConstraint() {
        return this._modelConstraint;
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for exporting a system
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleExportSystem = (elementsSelected, PluginExporter) => {
        this.model.exportSystem(elementsSelected, PluginExporter);
    }

    // Handler for importing a system
    handleImportSystem = (system, elementsSelected) => {
        this.model.importSystem(system, elementsSelected);
    }

    // Handler for resetting a system
    handleResetSystem = (elementsSelected) => {
        this.model.resetSystem(elementsSelected);
    }
    
    
    toString() {
        return `ControllerExportImport with ${this.view} and ${this.model}`;
    }
    
}

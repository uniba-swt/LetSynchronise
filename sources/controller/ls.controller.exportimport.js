'use strict';

class ControllerExportImport {
    _view = null;
    _model = null;
    _modelTask = null;
    _modelDependency = null;
    
    constructor() { }
    
    set view(view) {
        this._view = view;

        // Register the handlers when setting the view.
        this._view.registerExportButtonHandler(this.handleExport);
        this._view.registerImportButtonHandler(this.handleImport);
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
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for exporting a system
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleExport = () => {
        this.model.exportSystem();
    }

    // Handler for importing a system
    handleImport = (system) => {
    	this.model.importSystem(system);
    }
    
    toString() {
        return `ControllerExportImport with ${this.view} and ${this.model}`;
    }
}

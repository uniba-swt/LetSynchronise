'use strict';

class ControllerCore {
    _view = null;
    _model = null;
    _modelTask = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerSubmitHandler(this.handleCreateCore);
        this._view.registerDeleteHandler(this.handleDeleteCore);
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
        
        // Register the handlers when setting the model.
        this._model.registerUpdateCoresCallback(this.callbackUpdateCores);

        // Hack to populate the View with cores once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.refreshViews();
        });
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
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating a core.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateCore = (core) => {
        this.model.createCore(core);
    }
    
    // Handler for deleting a core.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleDeleteCore = (name) => {
        this.model.deleteCore(name);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed cores.
    callbackUpdateCores = (cores) => {
        this.view.updateCores(cores);
    }
    
    toString() {
        return `ControllerCore with ${this.view} and ${this.model}`;
    }
}

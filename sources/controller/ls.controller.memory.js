'use strict';

class ControllerMemory {
    _view = null;
    _model = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerSubmitHandler(this.handleCreateMemory);
        this._view.registerDeleteHandler(this.handleDeleteMemory);
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
        
        // Register the handlers when setting the model.
        this._model.registerUpdateMemoriesCallback(this.callbackUpdateMemories);

        // Hack to populate the View with cores once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.refreshViews();
        });
    }
    
    get model() {
        return this._model;
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating a memory module.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateMemory = (memory) => {
        this.model.createMemory(memory);
    }
    
    // Handler for deleting a memory module.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleDeleteMemory = (name) => {
        this.model.deleteMemory(name);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed memories.
    callbackUpdateMemories = (memories) => {
        this.view.updateMemories(memories);
    }
    
    toString() {
        return `ControllerMemory with ${this.view} and ${this.model}`;
    }
}

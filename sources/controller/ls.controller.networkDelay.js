'use strict';

class ControllerNetworkDelay {
    _view = null;
    _model = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerSubmitHandler(this.handleCreateNetworkDelay);
        this._view.registerDeleteHandler(this.handleDeleteNetworkDelay);
    }

    get view() {
        return this._view;
    }
    
    set viewSchedule(viewSchedule) {
        this._viewSchedule = viewSchedule;
    }
    
    get viewSchedule() {
        return this._viewSchedule;
    }
    
    set model(model) {
        this._model = model;
        
        // Register the handlers when setting the model.
        this._model.registerUpdateNetworkDelaysCallback(this.callbackUpdateNetworkDelays);

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
    
    // Handler for creating a core.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateNetworkDelay = (networkDelay) => {
        this.model.createNetworkDelay(networkDelay);
    }
    
    // Handler for deleting a core.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleDeleteNetworkDelay = (networkDelay) => {
        this.model.deleteNetworkDelay(networkDelay);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed cores.
    callbackUpdateNetworkDelays = (networkDelays) => {
        this.view.updateNetworkDelays(networkDelays);
    }
    
    toString() {
        return `ControllerCore with ${this.view} and ${this.model}`;
    }
}

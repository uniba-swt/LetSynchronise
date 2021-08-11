'use strict';

class ControllerEventChain {
    _view = null;
    _model = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerNextHander(this.handleNextDependency);
        this._view.registerSubmitHandler(this.handleCreateEventChain);
        this._view.registerDeleteHandler(this.handleDeleteEventChain);
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
        
        // Register the handlers when setting the model.
        this._model.registerUpdateEventChainsCallback(this.callbackUpdateEventChains);
        this._model.registerUpdateEventChainSelectorsCallback(this.callbackUpdateEventChainSelectors)
        
        // Hack to populate the View with event chains once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.refreshViews();
        });
    }
    
    get model() {
        return this._model;
    }
    
    set modelDependency(modelDependency) {
        this._modelDependency = modelDependency;
        
        // Register the model task with the model.
        this._model.registerModelDependency(this._modelDependency);
    }
    
    get modelDependency() {
        return this._modelDependency;
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for updating event chain to be created.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleNextDependency = (dependency) => {
    	// Get next dependencies
    	this.modelDependency.getNextDependencies(dependency)
    		.then(result => this.view.updateNextDependency(dependency, result));
    }
    
    // Handler for creating event chain.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateEventChain = (eventChain) => {
        this.model.createEventChain(eventChain);
    }
    
    // Handler for deleting event chain.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleDeleteEventChain = (name) => {
        this.model.deleteEventChain(name);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed event chains.
    callbackUpdateEventChains = (eventChains) => {
        this.view.updateEventChains(eventChains);
    }
    
    // Callback for updating the displayed event chain selectors.
    callbackUpdateEventChainSelectors = (dependencies) => {
        this.view.updateEventChainSelectors(dependencies);
    }
    
    toString() {
        return `ControllerEventChain with ${this.view} and ${this.model}`;
    }
}

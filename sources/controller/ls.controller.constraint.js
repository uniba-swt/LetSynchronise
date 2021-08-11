'use strict';

class ControllerConstraint {
    _view = null;
    _model = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerSubmitHandler(this.handleCreateConstraint);
        this._view.registerDeleteHandler(this.handleDeleteConstraint);
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
        
        // Register the handlers when setting the model.
        this._model.registerUpdateConstraintsCallback(this.callbackUpdateConstraints);
        this._model.registerUpdateConstraintSelectorsCallback(this.callbackUpdateConstraintSelectors)
        
        // Hack to populate the View with constraints once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.refreshViews();
        });
    }
    
    get model() {
        return this._model;
    }

    set modelEventChain(modelEventChain) {
        this._modelEventChain = modelEventChain;
        
        // Register the model task with the model.
        this._model.registerModelEventChain(this._modelEventChain);
    }
    
    get modelEventChain() {
        return this._modelEventChain;
    }

    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating constraint.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateConstraint = (constraint) => {
        this.model.createConstraint(constraint);
    }
    
    // Handler for deleting constraint.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleDeleteConstraint = (name) => {
        this.model.deleteConstraint(name);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed constraints.
    callbackUpdateConstraints = (constraints) => {
        this.view.updateConstraints(constraints);
    }
    
    // Callback for updating the displayed constraint selectors.
    callbackUpdateConstraintSelectors = (eventChains) => {
        this.view.updateConstraintSelectors(eventChains);
    }
    
    toString() {
        return `ControllerConstraint with ${this.view} and ${this.model}`;
    }
}

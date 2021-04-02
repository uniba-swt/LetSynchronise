'use strict';

class ControllerConstraint {
    _view = null;
    _model = null;
    _modelTask = null;
	_modelInterface = null;
    
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

    set modelTask(modelTask) {
        this._modelTask = modelTask;
        
        // Register the model task with the model.
		this._model.registerModelTask(this._modelTask);
    }
    
    get modelTask() {
        return this._modelTask;
    }
    
    set modelInterface(modelInterface) {
        this._modelInterface = modelInterface;
        
        // Register the model interface with the model.
        this._model.registerModelInterface(this._modelInterface);
    }
    
    get modelInterface() {
        return this._modelInterface;
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
    callbackUpdateConstraintSelectors = (taskParametersSet, systemInputs, systemOutputs) => {
        this.view.updateConstraintSelectors(taskParametersSet, systemInputs, systemOutputs);
    }
    
    toString() {
    	return `ControllerConstraint with ${this.view} and ${this.model}`;
    }
}

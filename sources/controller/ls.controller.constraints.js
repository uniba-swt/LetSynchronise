'use strict';

class ControllerConstraints {
    _view = null;
    _model = null;
    _modelTask = null;      // Hack to allow new inputs/outputs to be displayed in the View's constraint selection when a task is added
    
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
        
        // Hack to populate the View with constraints once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.getAllConstraints([this.callbackUpdateConstraints]);
        });
    }
    
    get model() {
        return this._model;
    }

    set modelTask(modelTask) {
        this._modelTask = modelTask;
        
        // Register the handlers when setting the model.
        this._modelTask.registerUpdateConstraintSelectorsCallback(this.callbackUpdateConstraintSelectors);

        // Hack to populate the View with constraint once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._modelTask.getAllTasks([this.callbackUpdateConstraintSelectors]);
        });
    }
    
    get modelTask() {
        return this._modelTask;
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating constraints.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateConstraint = (constraint) => {
        this.model.createConstraint(constraint);
    }
    
    // Handler for deleting constraints.
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
    callbackUpdateConstraintSelectors = (taskParametersSet) => {
        this.view.updateConstraintSelectors(taskParametersSet);
    }
    
    toString() {
    	return `ControllerConstraints with ${this.view} and ${this.model}`;
    }
}

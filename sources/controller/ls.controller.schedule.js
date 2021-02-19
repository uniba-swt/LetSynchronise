'use strict';

class ControllerSchedule {
    _view = null;
    _model = null;
    _modelDependencies = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerUpdateHandler(this.handleGetSchedule);
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
                
        // Hack to populate the View with dependencies once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.getSchedule([this.callbackGetSchedule]);
        });
    }
    
    get model() {
        return this._model;
    }
    
    set modelDependencies(modelDependencies) {
        this._modelDependencies = modelDependencies;
        
        // Register the model dependency with the view.
        this._view.registerModelDependencies(this._modelDependencies);
    }
    
    get modelDependencies() {
        return this._modelDependencies;
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for updating the task schedule.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleGetSchedule = (callback, makespan) => {
        this.model.getSchedule([callback], makespan);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the task schedule.
    callbackGetSchedule = (schedule) => {
        this.view.updateSchedule(schedule);
    }

    toString() {
    	return `ControllerSchedule with ${this.view} and ${this.model}`;
    }
}

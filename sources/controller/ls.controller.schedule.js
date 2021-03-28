'use strict';

class ControllerSchedule {
    _view = null;
    _model = null;
    _modelDependency = null;
    
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
                
        // Hack to populate the View with the schedule once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            const promiseTaskAndInstances = this._model.getSchedule(this._view.makespan);
            this.callbackGetSchedule(promiseTaskAndInstances);
        });
    }
    
    get model() {
        return this._model;
    }
    
    set modelDependency(modelDependency) {
        this._modelDependency = modelDependency;
        
        // Register the model dependency with the view.
        this._view.registerModelDependency(this._modelDependency);
    }
    
    get modelDependency() {
        return this._modelDependency;
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for updating the task schedule.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleGetSchedule = (callback, makespan) => {
		const promiseTaskAndInstances = this._model.getSchedule(makespan);
		this.callbackGetSchedule(promiseTaskAndInstances);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the task schedule.
    callbackGetSchedule = (promiseTaskAndInstances) => {
        this._view.updateSchedule(promiseTaskAndInstances);
    }

    toString() {
        return `ControllerSchedule with ${this.view} and ${this.model}`;
    }
}

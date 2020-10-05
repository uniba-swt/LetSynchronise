'use strict';

class ControllerTask {
    _view = null;
    _model = null;
    
    constructor() { }
    
    // Register the handlers when setting the view.
    set view(view) {
        this._view = view;
        this._view.registerSubmitHandler(this.handleCreateTask);
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
    
    // Handler for creating a task.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateTask = (taskParameters) => {
        this.model.createTask(taskParameters);
    }

    toString() {
    	return `ControllerTask with ${this.view} and ${this.model}`;
    }
}

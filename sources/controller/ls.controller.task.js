'use strict';

class ControllerTask {
    _view = null;
    _model = null;
    
    constructor() { }
    
    set view(view) {
        this._view = view;

        // Register the handlers when setting the view.
        this._view.registerSubmitHandler(this.handleCreateTask);
    }
    
    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
        
        // Register the handlers when setting the model.
        this._model.registerUpdateTaskCallback(this.callbackUpdateTasks);
        
        // Hack to populate the View with tasks once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.getAllTasks();
        });
    }
    
    get model() {
        return this._model;
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating a task.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateTask = (taskParameters) => {
        this.model.createTask(taskParameters);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed tasks.
    callbackUpdateTasks = (tasks) => {
        this.view.updateTasks(tasks);
    }

    
    toString() {
    	return `ControllerTask with ${this.view} and ${this.model}`;
    }
}

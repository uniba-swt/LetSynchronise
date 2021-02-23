'use strict';

class ControllerDependencies {
    _view = null;
    _model = null;
    _modelTask = null;      // Hack to allow new inputs/outputs to be displayed in the View's dependency selection when a task is added
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerSubmitHandler(this.handleCreateDependency);
        this._view.registerDeleteHandler(this.handleDeleteDependency);
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
        
        // Register the handlers when setting the model.
        this._model.registerUpdateDependenciesCallback(this.callbackUpdateDependencies);
        
        // Hack to populate the View with dependencies once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.getAllDependencyDefinitions([this.callbackUpdateDependencies]);
        });
    }
    
    get model() {
        return this._model;
    }

    set modelTask(modelTask) {
        this._modelTask = modelTask;
        
        // Register the handlers when setting the model.
        this._modelTask.registerUpdateDependencySelectorsCallback(this.callbackUpdateDependencySelectors);

        // Hack to populate the View with dependencies once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._modelTask.getAllTasks([this.callbackUpdateDependencySelectors]);
        });
    }
    
    get modelTask() {
        return this._modelTask;
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating input/output dependencies.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateDependency = (taskDependency) => {
        this.model.createDependency(taskDependency);
    }
    
    // Handler for deleting input/output dependencies.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleDeleteDependency = (name) => {
        this.model.deleteDependency(name);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed task dependencies.
    callbackUpdateDependencies = (dependencies) => {
        this.view.updateDependencies(dependencies);
    }
    
    // Callback for updating the displayed task dependency selectors.
    callbackUpdateDependencySelectors = (taskParametersSet) => {
        this.view.updateDependencySelectors(taskParametersSet);
    }
    
    toString() {
    	return `ControllerDependencies with ${this.view} and ${this.model}`;
    }
}

'use strict';

class ControllerDependency {
    _view = null;
    _model = null;
    _modelTask = null;
    _modelInterface = null;
    
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
        this._model.registerUpdateDependencySelectorsCallback(this.callbackUpdateDependencySelectors);

        // Hack to populate the View with dependencies once the database is ready
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
        
//        this._modelTask.registerUpdateDependencySelectorsCallback(this.callbackUpdateDependencySelectors);

        // Hack to populate the View with dependencies once the database is ready
//        window.addEventListener('DatabaseReady', (event) => {
//            this._modelTask.getAllTasks()
//            	.then(result => this.callbackUpdateDependencySelectors(result));
//        });
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
    
    // Handler for creating input/output dependency.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateDependency = (taskDependency) => {
        this.model.createDependency(taskDependency);
    }
    
    // Handler for deleting input/output dependency.
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
    callbackUpdateDependencySelectors = (taskParametersSet, systemInputs, systemOutputs) => {
        this.view.updateDependencySelectors(taskParametersSet, systemInputs, systemOutputs);
    }
    
    toString() {
    	return `ControllerDependency with ${this.view} and ${this.model}`;
    }
}

'use strict';

class ControllerDependency {
    _view = null;
    _model = null;
    _modelEntity = null;
    _modelInterface = null;
    _modelCore = null;
    
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

    set modelEntity(modelEntity) {
        this._modelEntity = modelEntity;
        
        // Register the model entity with the model.
        this._model.registerModelEntity(this._modelEntity);
    }
    
    get modelEntity() {
        return this._modelEntity;
    }
    
    set modelInterface(modelInterface) {
        this._modelInterface = modelInterface;
        
        // Register the model interface with the model.
        this._model.registerModelInterface(this._modelInterface);
    }
    
    get modelInterface() {
        return this._modelInterface;
    }

    set modelEventChain(modelEventChain) {
        this._modelEventChain = modelEventChain;
        
        // Register the model interface with the model.
        this._model.registerModelEventChain(this._modelEventChain);
    }
    
    get modelEventChain() {
        return this._modelEventChain;
    }

    get modelCore() {
        return this._modelCore;
    }

    set modelCore(modelCore) {
        this._modelCore = modelCore;
        this._model.registerModelCore(this._modelCore);
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating input/output dependency.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateDependency = (entityDependency) => {
        this.model.createDependency(entityDependency);
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

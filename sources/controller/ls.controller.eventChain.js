'use strict';

class ControllerEventChain {
    _view = null;
    _model = null;
    _modelDependency = null;
    _modelConstraint = null;
    _controllerSchedule = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerNextHander(this.handleNextDependency);
        this._view.registerClearHander(this.handleClearDependencies);
        this._view.registerSubmitHandler(this.handleCreateEventChain);
        this._view.registerDeleteHandler(this.handleDeleteEventChain);
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
        
        // Register the handlers when setting the model.
        this._model.registerUpdateEventChainsCallback(this.callbackUpdateEventChains);
        this._model.registerUpdateEventChainSelectorsCallback(this.callbackUpdateEventChainSelectors)
        
        // Hack to populate the View with event chains once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.refreshViews();
        });
    }
    
    get model() {
        return this._model;
    }
    
    set modelDependency(modelDependency) {
        this._modelDependency = modelDependency;
        
        // Register the model dependency with the model.
        this._model.registerModelDependency(this._modelDependency);
    }
    
    get modelDependency() {
        return this._modelDependency;
    }
    
    set modelConstraint(modelConstraint) {
        this._modelConstraint = modelConstraint;
        
        // Register the model constraint with the model.
        this._model.registerModelConstraint(this._modelConstraint);
    }
    
    get modelConstraint() {
        return this._modelConstraint;
    }
    
    set controllerSchedule(controllerSchedule) {
        this._controllerSchedule = controllerSchedule;
    }
    
    get controllerSchedule() {
        return this._controllerSchedule;
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for updating event chain to be created.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleNextDependency = (dependencyName) => {
        this.modelDependency.getSuccessorDependencies(dependencyName)
            .then(result => this.view.updateNextDependency(dependencyName, result));
    }
    
    // Handler for updating event chain to be created.
    handleClearDependencies = () => {
        this.modelDependency.getAllDependencies()
            .then(result => this.callbackUpdateEventChainSelectors(result));
    }
    
    // Handler for creating event chain.
    handleCreateEventChain = (eventChainRaw) => {
        this.model.createEventChainFromNames(eventChainRaw)
            .then(this.modelConstraint.refreshViews());
    }
    
    // Handler for deleting event chain.
    handleDeleteEventChain = (name) => {
        this.model.deleteEventChain(name)
            .then(this.modelConstraint.refreshViews());
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed event chains.
    callbackUpdateEventChains = (eventChains) => {
        this.view.updateEventChains(eventChains);
        
        this.controllerSchedule.handleGetSchedule(false);
    }
    
    // Callback for updating the displayed event chain selectors.
    callbackUpdateEventChainSelectors = (dependencies) => {
        this.view.updateEventChainSelectors(dependencies);
    }
    
    toString() {
        return `ControllerEventChain with ${this.view} and ${this.model}`;
    }
}

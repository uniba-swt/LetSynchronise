'use strict';

class ControllerInterface {
    _view = null;
    _model = null;
    _modelDependency = null;
    _modelEventChain = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerSubmitInputHandler(this.handleCreateInput);
        this._view.registerSubmitOutputHandler(this.handleCreateOutput);
        this._view.registerDeleteInputHandler(this.handleDeleteInput);
        this._view.registerDeleteOutputHandler(this.handleDeleteOutput);
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
        
        // Register the handlers when setting the model.
        this._model.registerUpdateInterfaceCallback(this.callbackUpdateInterface);
        
        // Hack to populate the View with system inputs and outputs once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            Promise.all([this._model.getAllInputs(), this._model.getAllOutputs()])
                .then(([inputs, outputs]) => this.callbackUpdateInterface(inputs, outputs));
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
    }
    
    get modelConstraint() {
        return this._modelConstraint;
    }
    
    set modelEventChain(modelEventChain) {
        this._modelEventChain = modelEventChain;
 
         // Register the model event chain with the model.
        this._model.registerModelEventChain(this._modelEventChain);
    }
    
    get modelEventChain() {
        return this._modelEventChain;
    }
        
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating system input.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateInput = (name) => {
        this.model.createInput(name)
            .then(this.modelDependency.refreshViews())
            .then(this.modelConstraint.refreshViews());
    }
    
    // Handler for creating system output.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateOutput = (name) => {
        this.model.createOutput(name)
            .then(this.modelDependency.refreshViews())
            .then(this.modelConstraint.refreshViews());
    }
    
    handleDeleteInput = (name) => {
        this.model.deleteInput(name);
    }
    
    handleDeleteOutput = (name) => {
        this.model.deleteOutput(name);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed system inputs and outputs.
    callbackUpdateInterface = (inputs, outputs) => {
        this.view.updateInterface(inputs, outputs);
    }
    

    toString() {
        return `ControllerInterface with ${this.view} and ${this.model}`;
    }
}

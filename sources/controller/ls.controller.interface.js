'use strict';

class ControllerInterface {
    _view = null;
    _model = null;
    
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
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating system input.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateInput = (name) => {
        this.model.createInput(name);
    }
    
    // Handler for creating system output.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateOutput = (name) => {
        this.model.createOutput(name);
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

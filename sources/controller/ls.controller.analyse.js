'use strict';

class ControllerAnalyse {
    _view = null;
    _model = null;
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerUpdateHandler(this.handleAnalyse);
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
        this._model.registerAnalyseCallback(this._view.updateAnalyse);
    }
    
    get model() {
        return this._model;
    }
    

    // Handler for updating the task analysis.
    handleAnalyse = () => {
        console.log("Analyse Controller");
        this._model.analyse();
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    toString() {
        return `ControllerAnalyse with ${this.view} and ${this.model}`;
    }
}

'use strict';

class ControllerAnalyse {
    _view = null;
    _viewSchedule = null;
    _model = null;
    _modelConstraint = null;
    _modelEventChain = null;
    _controllerSchedule = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerAnalyseHandler(this.handleGetAnalyse);
        this._view.registerAnalyseCloseHandler(this.handleCloseAnalyse);
    }

    get view() {
        return this._view;
    }
    
    set viewSchedule(viewSchedule) {
        this._viewSchedule = viewSchedule;
    }
    
    get viewSchedule() {
        return this._viewSchedule;
    }
    
    set model(model) {
        this._model = model;
        
        // Register the handlers when setting the model.
        this._model.registerAnalyseCallback(this._view.updateAnalyse);
    }
    
    get model() {
        return this._model;
    }
    
    set modelConstraint(modelConstraint) {
        this._modelConstraint = modelConstraint;

        // Register the model constraint with the model.
        this._model.registerModelConstraint(this._modelConstraint);
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
    
    
    set controllerSchedule(controllerSchedule) {
        this._controllerSchedule = controllerSchedule;
    }
    
    get controllerSchedule() {
        return this._controllerSchedule;
    }


    // -----------------------------------------------------
    // Handlers for events from the view to the model

    // Handler for updating the schedule analysis.
    // Wait for the schedule to be updated before analysing.
    handleGetAnalyse = () => {
        const promises = this.controllerSchedule.handleGetSchedule(this.viewSchedule.makespan);
        Promise.all(Object.keys(promises).map(key => promises[key])).then(result => {
            const promise = this.model.getAnalyse();
            this.callbackGetAnalyse(promise);
        });
    }
    
    handleCloseAnalyse = () => {
        this.callbackCloseAnalyse();
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the schedule analysis.
    callbackGetAnalyse = (promise) => {
        this.view.updateAnalyse(promise);
    }
    
    callbackCloseAnalyse = () => {
        this.view.clearAnalyseModal();
    }
    
    toString() {
        return `ControllerAnalyse with ${this.view} and ${this.model}`;
    }
}

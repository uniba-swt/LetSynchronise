'use strict';

class ControllerAnalyse {
    _view = null;
    _model = null;
    _modelDependency = null;
    _modelConstraint = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerAnalyseHandler(this.handleAnalyse);
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
        
        // Register the handlers when setting the model.
        this._model.registerAnalyseCallback(this._view.updateAnalyse);
    }
    
    get model() {
        return this._model;
    }
    
    set modelTask(modelTask) {
        this._modelTask = modelTask;
        
        // Register the model task with the model.
        this._model.registerModelTask(this._modelTask);
    }
    
    get modelTask() {
        return this._modelTask;
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

    // -----------------------------------------------------
    // Handlers for events from the view to the model

    // Handler for updating the schedule analysis.
    handleAnalyse = () => {
        console.log("Analyse Controller");
    //    this.modelSchedule.refreshViews();
        this.model.analyse();
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    toString() {
        return `ControllerAnalyse with ${this.view} and ${this.model}`;
    }
}

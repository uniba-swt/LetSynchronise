'use strict';

class ControllerSchedule {
    _view = null;
    _model = null;
    _modelTask = null;
    _modelDependency = null;
    _modelEventChain = null;
    _modelConstraint = null;
        
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerUpdateHandler(this.handleGetSchedule);
        this._view.registerAutoSyncHandler(this.handleAutoSync);
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
                
        // Hack to populate the View with the schedule once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            const promise = this._model.getSchedule(this._view.makespan);
            this.callbackGetSchedule(promise);
        });
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
    
    set modelEventChain(modelEventChain) {
        this._modelEventChain = modelEventChain;

        // Register the model event chain with the model.
        this._model.registerModelEventChain(this._modelEventChain);
    }
    
    get modelEventChain() {
        return this._modelEventChain;
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
    
    // Handler for updating the task schedule.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleGetSchedule = (makespan, reinstantiateTasks) => {
        if (reinstantiateTasks) {
            this.model.reinstantiateTasks(makespan)
                .then(result => this.model.getSchedule(makespan))
                .then(result => this.callbackGetSchedule(result));
        } else {
            const promiseSchedule = this.model.getSchedule(makespan);
            this.callbackGetSchedule(promiseSchedule);
        }
    }
    
    // Handler for optimising the task set and schedule.
    handleAutoSync = (makespan, pluginGoal, pluginScheduler) => {
        pluginGoal.Result()
            .then(result => this.handleGetSchedule(makespan, true));
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the task schedule.
    callbackGetSchedule = (promise) => {
        this.view.updateSchedule(promise);
    }

    toString() {
        return `ControllerSchedule with ${this.view} and ${this.model}`;
    }
}

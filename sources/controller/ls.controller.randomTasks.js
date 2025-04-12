'use strict';

class ControllerRandomTasks {
    _view = null;
    _modelEntity = null;
    _modelDependency = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerSubmitHandler(this.handleGenerateRandomTasks);
    }

    get view() {
        return this._view;
    }

    set modelEntity(modelEntity) {
        this._modelEntity = modelEntity;
    }

    get modelEntity() {
        return this._modelEntity;
    }

    set modelDependency(modelDependency) {
        this._modelDependency = modelDependency;
    }

    get modelDependency() {
        return this._modelDependency;
    }


    // -----------------------------------------------------
    // Handlers for events from the view to the model

    // Handler for updating the schedule analysis.
    handleGenerateRandomTasks = (parameters) => {
        const elements = ['schedule', 'inputs', 'outputs', 'entities', 'dependencies', 'eventChains', 'constraints']

        return Plugin.ModelDatabase.deleteSystem(elements)
            .then(result => this.modelEntity.generateRandomTasks(parameters))
            .then(result => this.modelDependency.generateRandomDependencies(parameters.numDependencies));
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the schedule analysis.
    
    toString() {
        return `ControllerRandomTasks with ${this.view} and ${this.model}`;
    }
}

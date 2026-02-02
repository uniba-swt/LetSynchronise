'use strict';

class ControllerEntity {
    _view = null;
    _viewRandomTasks = null;
    _viewSchedule = null;
    _model = null;
    _modelCore = null;
    _modelDependency = null;
    _modelEventChain = null;
    _modelSchedule = null;
    
    constructor() { }
    
    set view(view) {
        this._view = view;

        // Register the handlers when setting the view.
        this._view.registerSubmitHandler(this.handleCreateEntity);
        this._view.registerDeleteHandler(this.handleDeleteEntity);
        this._view.registerGetCoreHandler(this.handleGetCore);
    }
    
    get view() {
        return this._view;
    }
    
    set viewRandomTasks(viewRandomTasks) {
        this._viewRandomTasks = viewRandomTasks;
        
        // Register the handlers when setting the view.
        this._viewRandomTasks.registerSubmitHandler(this.handleGenerateRandomTasks);
    }
    
    get viewRandomTasks() {
        return this._viewRandomTasks;
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
        this._model.registerUpdateCoreSelectorCallback(this.callbackUpdateCoreSelector);
        this._model.registerUpdateTasksCallback(this.callbackUpdateTasks);
        this._model.registerRevalidateTaskParametersCallback(this.callbackRevalidateTaskParameters);
        this._model.registerClearPreviewCallback(this.callbackClearPreview);
        this._model.registerNotifyChangesCallback(this.callbackNotifyChanges);
        
        // Hack to populate the View with tasks once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.refreshViews();
        });
    }
    
    get model() {
        return this._model;
    }
    
    set modelCore(modelCore) {
        this._modelCore = modelCore;
        
        // Register the model core with the model.
        this._model.registerModelCore(this._modelCore);
    }
    
    get modelCore() {
        return this._modelCore;
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

    get modelSchedule() {
        return this._modelSchedule;
    }

    set modelSchedule(modelSchedule) {
        this._modelSchedule = modelSchedule;
        //this._model.registerModelSchedule(this._modelSchedule);
    }
    

    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating an entity.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateEntity = (entityParameters) => {
        this.model.createEntity(entityParameters);
    }
    
    // Handler for deleting an entity.
    handleDeleteEntity = (name) => {
        this.model.deleteEntity(name);
    }
    
    // Handler for getting the details of a core.
    handleGetCore = (name) => {
        return this.modelCore.getCore(name);
    }
    
    // Handler for generating a random task set.
    handleGenerateRandomTasks = (parameters) => {
        const elements = ['schedule', 'entities', 'dependencies', 'eventChains', 'constraints']
        
        return Plugin.ModelDatabase.deleteSystem(elements)
            .then(result => this.model.generateRandomTasks(parameters))
            .then(result => this.modelDependency.generateRandomDependencies(parameters.numDependencies));
    }
        
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed core selector.
    callbackUpdateCoreSelector = (cores) => {
        this.view.updateCoreSelector(cores);
    }
    
    // Callback for updating the displayed tasks.
    callbackUpdateTasks = (tasks, cores) => {
        this.view.updateTasks(tasks, cores);
    }

    // Callback for revalidating a task.
    callbackRevalidateTaskParameters = (taskParameters, core) => {
        return this.view.revalidateTaskParameters(taskParameters, core);
    }
    
    // Callback for clearing the task preview.
    callbackClearPreview = () => {
        return this.view.clearPreview();
    }

    // Callback for notifying the schedule view that tasks have changed.
    callbackNotifyChanges = () => {
        this.viewSchedule.notifyChanges();
    }
    
    
    toString() {
        return `ControllerEntity with ${this.view} and ${this.model}`;
    }
}

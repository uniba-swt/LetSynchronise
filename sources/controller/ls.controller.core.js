'use strict';

class ControllerCore {
    _view = null;
    _viewSchedule = null;
    _model = null;
    _modelEntity = null;
    _modelDevice = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerSubmitHandler(this.handleCreateCore);
        this._view.registerDeleteHandler(this.handleDeleteCore);
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
        this._model.registerUpdateCoresCallback(this.callbackUpdateCores);
        this._model.registerUpdateDeviceSelectorCallback(this.callbackUpdateDeviceSelector)
        this._model.registerNotifyChangesCallback(this.callbackNotifyChanges);

        // Hack to populate the View with cores once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.refreshViews();
        });
    }
    
    get model() {
        return this._model;
    }
    
    set modelEntity(modelEntity) {
        this._modelEntity = modelEntity;
        
        // Register the model task with the model.
        this._model.registerModelEntity(this._modelEntity);
    }
    
    get modelEntity() {
        return this._modelEntity;
    }

    set modelDevice(modelDevice) {
        this._modelDevice = modelDevice;
        
        this._model.registerModelDevice(this._modelDevice);
    }

    get modelDevice() {
        return this._modelDevice;
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating a core.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateCore = (core) => {
        this.model.createCore(core);
    }
    
    // Handler for deleting a core.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleDeleteCore = (name) => {
        this.model.deleteCore(name);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed cores.
    callbackUpdateCores = (cores) => {
        this.view.updateCores(cores);
    }

    // Callback for updating the displayed device selector.
    callbackUpdateDeviceSelector = (devices) => {
        this.view.updateDeviceSelector(devices);
    }
    
    // Callback for notifying the schedule view that cores have changed.
    callbackNotifyChanges = () => {
        this.viewSchedule.notifyChanges();
    }
    
    toString() {
        return `ControllerCore with ${this.view} and ${this.model}`;
    }
}

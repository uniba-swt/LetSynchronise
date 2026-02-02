'use strict';

class ControllerNetworkDelay {
    _view = null;
    _viewSchedule = null;
    _model = null;
    _modelDevice = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerSubmitHandler(this.handleCreateNetworkDelay);
        this._view.registerDeleteHandler(this.handleDeleteNetworkDelay);
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
        this._model.registerUpdateNetworkDelaysCallback(this.callbackUpdateNetworkDelays);
        this._model.registerUpdateDeviceSelectorCallback(this.callbackUpdateDeviceSelector);
        this._model.registerNotifyChangesCallback(this.callbackNotifyChanges);

        // Hack to populate the View with network delays once the database is ready
        window.addEventListener('DatabaseReady', (event) => {
            this._model.refreshViews();
        });
    }
    
    get model() {
        return this._model;
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
    
    // Handler for creating a network delay.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateNetworkDelay = (networkDelay) => {
        this.model.createNetworkDelay(networkDelay);
    }
    
    // Handler for deleting a network delay.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleDeleteNetworkDelay = (networkDelay) => {
        this.model.deleteNetworkDelay(networkDelay);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed network delays.
    callbackUpdateNetworkDelays = (networkDelays) => {
        this.view.updateNetworkDelays(networkDelays);
    }

    // Callbackk for updating the displayed device selectors
    callbackUpdateDeviceSelector = (devices) => {
        this.view.updateDeviceSelector(devices);
    }
    
    // Callback for notifying the schedule view that tasks have changed.
    callbackNotifyChanges = () => {
        this.viewSchedule.notifyChanges();
    }
    
    toString() {
        return `ControllerNetworkDelay with ${this.view} and ${this.model}`;
    }
}

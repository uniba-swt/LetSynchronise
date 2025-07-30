'use strict';

class ControllerDevice {
    _view = null;
    _viewSchedule = null;
    _model = null;
    _modelEntity = null;
    _modelCore = null;
    _modelNetworkDelay = null;
    _modelDependency = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
        
        // Register the handlers when setting the view.
        this._view.registerSubmitHandler(this.handleCreateDevice);
        this._view.registerDelaySubmitHandler(this.handleDeviceDelay);
        this._view.registerDeleteHandler(this.handleDeleteDevice);
        this._view.registerDeleteDelayHandler(this.handleDeleteDelay);
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
        this._model.registerUpdateDevicesCallback(this.callbackUpdateDevices);
        this._model.registerUpdateDevicesDelayCallback(this.callbackUpdateDevicesDelay);

        // Hack to populate the View with devices once the database is ready
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

    set modelCore(modelCore) {
        this._modelCore = modelCore;
        
        // Register the model core with the model.
        this._model.registerModelCore(this._modelCore);
    }
    
    get modelCore() {
        return this._modelCore;
    }

    set modelNetworkDelay(modelNetworkDelay) {
        this._modelNetworkDelay = modelNetworkDelay;

        this._model.registerModelNetworkDelay(this._modelNetworkDelay);
    }

    get modelNetworkDelay() {
        return this._modelNetworkDelay;
    }

    set modelDependency(modelDependency) {
        this._modelDependency = modelDependency;
        this._model.registerModelDependency(this._modelDependency);
    }
    
    
    // -----------------------------------------------------
    // Handlers for events from the view to the model
    
    // Handler for creating a device.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleCreateDevice = (device) => {
        this.model.createDevice(device);
    }

    handleDeviceDelay = (device) => {
        this.model.addDelay(device);
    }
    
    // Handler for deleting a device.
    // Arrow function is used so that 'this' is accessible when the handler is called within the view.
    handleDeleteDevice = (name) => {
        this.model.deleteDevice(name);
    }

    handleDeleteDelay = (protocol, device) => {
        this.model.deleteDelay(protocol, device);
    }
    
    
    // -----------------------------------------------------
    // Callbacks for events from the model to the view
    
    // Callback for updating the displayed devices.
    callbackUpdateDevices = (devices) => {
        this.view.updateDevices(devices);
    }

    callbackUpdateDevicesDelay = (delays) => {
        this.view.updateDevicesDelay(delays);
    }
    
    toString() {
        return `ControllerDevice with ${this.view} and ${this.model}`;
    }
}

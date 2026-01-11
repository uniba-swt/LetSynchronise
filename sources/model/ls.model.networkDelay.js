'use strict';

class ModelNetworkDelay {
    updateNetworkDelays = null;         // Callback to function in ls.view.networkDelay
    updateDeviceSelector = null;        // Callback to function in ls.view.networkDelay
    notifyChanges = null;               // Callback to function in ls.view.schedule

    database = null;
    modelDevice = null;

    constructor() { }
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateNetworkDelaysCallback(callback) {
        this.updateNetworkDelays = callback;
    }

    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }

    registerUpdateDeviceSelectorCallback(callback) {
        this.updateDeviceSelector = callback;
    }

    registerModelDevice(modelDevice) {
        this.modelDevice = modelDevice;
    }
    
    registerNotifyChangesCallback(callback) {
        this.notifyChanges = callback;
    }
    
    
    // -----------------------------------------------------
    // Class methods
    
    createNetworkDelay(networkDelay) {
        this.getAllNetworkDelays()
            .then(delays => {
                const existingDelay = delays.find(delay => delay.name === networkDelay.name);

                if (existingDelay) {
                    existingDelay.bcdt = networkDelay.bcdt;
                    existingDelay.acdt = networkDelay.acdt;
                    existingDelay.wcdt = networkDelay.wcdt;
                    existingDelay.distribution = networkDelay.distribution;

                    return existingDelay
                } else {
                    return networkDelay;
                }
            })
            .then(result => this.database.putObject(Model.NetworkDelayStoreName, result))
            .then(result => this.refreshViews())
            .then(result => this.notifyChanges());
    }
    

    deleteNetworkDelay(delay) {
        return this.database.deleteObject(Model.NetworkDelayStoreName, delay)
            .then(result => this.refreshViews())
            .then(result => this.notifyChanges());

    }

    getNetworkDelay(source, dest) {
        return this.getAllNetworkDelays()
            .then(delays => delays.find(delay => delay.source === source && delay.dest === dest));
    }
    

    getAllNetworkDelays() {
        return this.database.getAllObjects(Model.NetworkDelayStoreName);
    }
    
    // Validate network delays against devices.
    async validate() {
        const allDeveices = (await this.modelDevice.getAllDevices()).map(device => device.name);
        const allNetworkDelays = await this.getAllNetworkDelays();
        
        for (const networkDelay of allNetworkDelays) {
            if (!allDeveices.includes(networkDelay.source) || !allDeveices.includes(networkDelay.dest)) {
                await this.deleteNetworkDelay(networkDelay.name);
            }
        }
        
        return this.refreshViews();
    }
    
    refreshViews() {
        return this.getAllNetworkDelays()
            .then(result => this.updateNetworkDelays(result))
            .then(result => this.modelDevice.getAllDevices())
            .then(devices => this.updateDeviceSelector(devices));
    }
    
    toString() {
        return "ModelNetworkDelay";
    }
}

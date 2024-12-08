'use strict';

class ModelNetworkDelay {
    updateNetworkDelays = null;
    updateDeviceSelector = null;

    database = null;
    modelDevice = null;

    constructor() { }
    
    static get Default() { return {'source': 'none', 'dest': 'none', 'delay': 'none'}; }
    
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
    
    // -----------------------------------------------------
    // Class methods
    
    createNetworkDelay(networkDelay) {
        // Store core in Database
        return this.database.putObject(Model.NetworkDelayStoreName, networkDelay)
            .then(this.refreshViews());
    }

    deleteNetworkDelay(networkDelay) {
        console.log(networkDelay)
        return this.database.deleteObject(Model.NetworkDelayStoreName, networkDelay)
            .then(this.refreshViews());
    }
    
    getNetworkDelay(networkDelay) {
        return this.database.getObject(Model.NetworkDelayStoreName, networkDelay)
            .catch(error => {
                return this.database.getAllObjects(Model.NetworkDelayStoreName)
                    .then(networkDelays => {
                        let defaultNetworkDelay = networkDelays;

                        return defaultNetworkDelay;
                    });
            });
    }

    getAllNetworkDelays() {
        return this.database.getAllObjectsWithKeys(Model.NetworkDelayStoreName);
    }
    
    deleteCore(networkDelay) {
        return this.database.deleteObject(Model.NetworkDelayStoreName, networkDelay)
            .then(this.refreshViews());
    }
    
    refreshViews() {
        return this.getAllNetworkDelays()
            .then(result => this.updateNetworkDelays(result))
            .then(devices => this.modelDevice.getAllDevices())
            .then(devices => this.updateDeviceSelector(devices));
    }
    
    toString() {
        return "ModelNetworkDelay";
    }
}

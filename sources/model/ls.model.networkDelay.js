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

    deleteNetworkDelay(index) {
        return this.database.deleteObject(Model.NetworkDelayStoreName, Number(index))
            .then(this.refreshViews());
    }
    
    getNetworkDelay(index) {
        return this.database.getObject(Model.NetworkDelayStoreName, Number(index))
            .catch(error => {
                return this.database.getAllObjects(Model.NetworkDelayStoreName)
                    .then(networkDelays => {
                        let defaultNetworkDelay = networkDelays;

                        return defaultNetworkDelay;
                    });
            });
    }

    getNetworkDelay(source, dest) {
        return this.getAllNetworkDelays().then(delays => {
            return delays.find(delay => delay.source === source && delay.dest === dest);
        });
    }
    

    getAllNetworkDelays() {
        return this.database.getAllObjectsWithKeys(Model.NetworkDelayStoreName);
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

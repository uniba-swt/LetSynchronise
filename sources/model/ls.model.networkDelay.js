'use strict';

class ModelNetworkDelay {
    updateNetworkDelays = null;
    updateDeviceSelector = null;

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
    
    // -----------------------------------------------------
    // Class methods
    
    createNetworkDelay(networkDelay) {
        this.getAllNetworkDelays().then(delays => {
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
            .then(result => {
                return this.database.putObject(Model.NetworkDelayStoreName, result);
            })
            .then(() => {
                this.refreshViews();
            })
    }
    

    deleteNetworkDelay(delay) {
        return this.database.deleteObject(Model.NetworkDelayStoreName, delay)
            .then(this.refreshViews());
    }

    getNetworkDelay(source, dest) {
        return this.getAllNetworkDelays().then(delays => {
            return delays.find(delay => delay.source === source && delay.dest === dest);
        });
    }
    

    getAllNetworkDelays() {
        return this.database.getAllObjects(Model.NetworkDelayStoreName);
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

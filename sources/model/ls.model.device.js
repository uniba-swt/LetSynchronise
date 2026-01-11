'use strict';

class ModelDevice {
    updateDevices = null;               // Callback to function in ls.view.device
    updateDevicesDelay = null;          // Callback to function in ls.view.device
    notifyChanges = null;               // Callback to function in ls.view.schedule

    database = null;
    modelCore = null;
    modelNetworkDelay = null;

    constructor() { }
    
    static get Default() { return {'name': 'Default', 'speedup': 1}; }
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateDevicesCallback(callback) {
        this.updateDevices = callback;
    }

    registerUpdateDevicesDelayCallback(callback) {
        this.updateDevicesDelay = callback;
    }

    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }

    registerModelCore(modelCore) {
        this.modelCore = modelCore;
    }

    registerModelNetworkDelay(modelNetworkDelay) {
        this.modelNetworkDelay = modelNetworkDelay;
    }
    
    registerNotifyChangesCallback(callback) {
        this.notifyChanges = callback;
    }
    
    
    // -----------------------------------------------------
    // Class methods
    
    createDevice(device) {
        // Store device in Database
        return this.database.putObject(Model.DeviceStoreName, device)
            .then(result => this.refreshViews())
            .then(result => this.notifyChanges());
    }
    
    getDevice(name) {
        return this.database.getObject(Model.DeviceStoreName, name)
            .catch(error => {
                // Return the default device parameters
                return this.database.getAllObjects(Model.DeviceStoreName)
                    .then(devices => {
                        let defaultDevice = ModelDevice.Default;
                        if (devices.length != 0) {
                            const slowestDevice = devices.reduce((min, current) => (min.speedup < current.speedup) ? min : current);
                            defaultDevice.speedup = slowestDevice.speedup;
                        }
                        return defaultDevice;
                    });
            });
    }

    getAllDevices() {
        return this.database.getAllObjects(Model.DeviceStoreName);
    }
    
    deleteDevice(name) {
        return this.database.deleteObject(Model.DeviceStoreName, name)
            .then(result => this.refreshViews())
            .then(result => this.notifyChanges());
    }
    
    refreshViews() {
        return this.getAllDevices()
            .then(result => this.updateDevices(result))
            .then(result => this.modelCore.refreshViews())
            .then(result => this.modelNetworkDelay.refreshViews());
    }
    
    addDelay(deviceDelay) {
        this.database.getObject(Model.DeviceStoreName, deviceDelay.name).then(device => {
            if (!device.delays) {
                device.delays = []
            }
            
            const existingProtocol = device.delays.find(delay => delay.protocol === deviceDelay.protocol)
            
            if (existingProtocol) {
                existingProtocol.bcdt = deviceDelay.bcdt;
                existingProtocol.acdt = deviceDelay.acdt;
                existingProtocol.wcdt = deviceDelay.wcdt;
                existingProtocol.distribution = deviceDelay.distribution;
            } else {
                device.delays.push({
                    'protocol': deviceDelay.protocol,
                    'bcdt': deviceDelay.bcdt,
                    'acdt': deviceDelay.acdt,
                    'wcdt': deviceDelay.wcdt,
                    'distribution': deviceDelay.distribution
                });
            }
            
            return this.database.putObject(Model.DeviceStoreName, device)
                .then(result => this.refreshDelayViews())
                .then(result => this.notifyChanges());
        })
    }

    deleteDelay(protocol, device) {
        this.database.getObject(Model.DeviceStoreName, device)
            .then(device => {
                device.delays = device.delays.filter(delay => delay.protocol !== protocol);
                return this.database.putObject(Model.DeviceStoreName, device);
            })
            .then(result => this.refreshDelayViews())
            .then(result => this.notifyChanges());
    }
    
    refreshDelayViews() {
        return this.getAllDevices()
            .then(result => this.updateDevicesDelay(result));
    }
    
    toString() {
        return "ModelDevice";
    }
}

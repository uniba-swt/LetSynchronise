'use strict';

class ModelDevice {
    updateDevices = null;                 // Callback to function in ls.view.device
    notifyChanges = null;               // Callback to function in ls.view.schedule

    database = null;
    modeltask = null;

    constructor() { }
    
    static get Default() { return {'name': 'Default', 'speedup': 1}; }
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateDevicesCallback(callback) {
        this.updateDevices = callback;
    }
    
    registerNotifyChangesCallback(callback) {
        this.notifyChanges = callback;
    }
    

    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }

    registerModelTask(modelTask) {
        this.modelTask = modelTask;
    }
    
    // -----------------------------------------------------
    // Class methods
    
    createDevice(device) {
        // Store device in Database
        return this.database.putObject(Model.DeviceStoreName, device)
            .then(this.refreshViews());
            // .then(this.notifyChanges());
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
            .then(this.refreshViews());
    }
    
    refreshViews() {
        return this.getAllDevices()
            .then(result => this.updateDevices(result));
            // .then(result => this.modelTask.validate());
    }
    
    toString() {
        return "ModelDevice";
    }
}

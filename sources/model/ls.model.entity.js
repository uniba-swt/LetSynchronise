'use strict';

class ModelEntity {
    updateCoreSelector = null;          // Callback to function in ls.view.task
    updateTasks = null;                 // Callback to function in ls.view.task
    revalidateTaskParameters = null;    // Callback to function in ls.view.task
    clearPreview = null;                // Callback to function in ls.view.task
    notifyChanges = null;               // Callback to function in ls.view.schedule

    database = null;
    modelCore = null;
    modelDevice = null;
    modelNetworkDelay = null;
    modelDependency = null;
    modelEventChain = null;
        
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller

    registerUpdateCoreSelectorCallback(callback) {
        this.updateCoreSelector = callback;
    }

    registerUpdateTasksCallback(callback) {
        this.updateTasks = callback;
    }
    
    registerRevalidateTaskParametersCallback(callback) {
        this.revalidateTaskParameters = callback;
    }
    
    registerClearPreviewCallback(callback) {
        this.clearPreview = callback;
    }
    
    registerNotifyChangesCallback(callback) {
        this.notifyChanges = callback;
    }
    
    
    // -----------------------------------------------------
    // Registration of models
    
    registerModelDatabase(database) {
        this.database = database;
    }
    
    registerModelCore(modelCore) {
        this.modelCore = modelCore;
    }

    registerModelDevice(modelDevice) {
        this.modelDevice = modelDevice
    }
    
    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }
    
    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
    }

    registerModelNetworkDelay(modeltNetworkDelay) {
        this.modelNetworkDelay = modeltNetworkDelay;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    async createTask(parameters) {
        if (parameters.type == "task") {
            // Delete dependencies that relied on task ports that are no longer exist.
            let dependenciesToRemove = [];
            let dependencies = await this.modelDependency.getAllDependencies();
            for (const dependency of dependencies) {
                // Check whether the dependency destination is this task.
                if (dependency.destination.task == parameters.name) {
                    // Check whether the task port still exists.
                    if (parameters.inputs.some(input => (input == dependency.destination.port)) == false) {
                        dependenciesToRemove.push(dependency);
                    }
                }

                // Check whether the dependency source is this task.
                if (dependency.source.task == parameters.name) {
                    // Check whether the task port still exists.
                    if (parameters.outputs.some(output => (output == dependency.source.port)) == false) {
                        dependenciesToRemove.push(dependency);
                    }
                }
            }
        }

        // Store task parameters into Database
        return this.database.putObject(Model.EntityStoreName, parameters)
            .then(this.refreshViews())
            .then(this.notifyChanges());
    }
    
    // Saves the changes to an existing task, without forcing the view to refresh
    saveChangedTask(task) {
        return this.database.putObject(Model.EntityStoreName, task)
            .then(this.notifyChanges());
    }
    
    getAllTasks() {
        return this.database.getAllObjects(Model.EntityStoreName);
    }
    

    getTask(task) {
        return this.database.getObject(Model.EntityStoreName, task);
    }
    
    getAllTaskInstances() {
        return this.database.getAllObjects(Model.EntityInstancesStoreName);
    }

    deleteTask(name) {
        return this.database.deleteObject(Model.EntityStoreName, name)
            .then(this.database.deleteObject(Model.EntityInstancesStoreName, name))
            .then(result => this.refreshViews());
    }

    addDelay(source, dest) {
        this.createTask(source);
    
        this.addProtocolDelay(source, "source")
        .then(this.addNetworkDelay(source, dest))
        .then(this.addProtocolDelay(dest, "dest"))
    }
    

    addProtocolDelay(task, position) {
        return this.modelCore.getCore(task.core)
        .then(core => this.modelDevice.getDevice(core.device)
        .then(device => {
            this.createTask(this.createProtocolDelay(task, device, position));
        }))
    }

    createProtocolDelay(task, device, position) {
        console.log(position);

        return {
            name: position === 'source' ? task.name + " encapsulation delay" : task.name + " decapsulation delay",
            type: "protocol delay",
            deviceName: device.name,
            protocol: device.delays[0].protocol,
            acdt: device.delays[0].acdt,
            bcdt: device.delays[0].bcdt,
            wcdt: device.delays[0].wcdt,
            distribution: device.delays[0].distribution,
        }
    }


    addNetworkDelay(source, dest) {
        return Promise.all([this.modelCore.getCore(source.core), this.modelCore.getCore(dest.core)])
        .then(([sourceCore, destCore]) => this.modelNetworkDelay.getNetworkDelay(sourceCore.device, destCore.device)
        .then(delay => {
            this.createTask(this.createNetworkDelay(source, dest, delay));
        }))
    }

    createNetworkDelay(source, dest, delay) {
        return {
            name: source.name + " => " + dest.name + " network delay",
            type: "network delay",
            source: source.name + " (" + delay.source + ")",
            dest: dest.name + " (" + delay.dest + ")",
            acdt: delay.acdt,
            bcdt: delay.bcdt,
            wcdt: delay.wcdt,
            distribution: delay.distribution,
        }
    }
    
    // Validate the tasks against the platform
    async validate() {
        const allCores = (await this.modelCore.getAllCores()).map(core => core.name);
        const allTasks = await this.getAllTasks();
        
        let changedTasks = [];
        let invalidTasks = [];
        for (const task of allTasks) {
            if (task.core != null && !allCores.includes(task.core)) {
                task.core = null;
                changedTasks.push(task);
            }
            
            const core = await this.modelCore.getCore(task.core);
            if (!this.revalidateTaskParameters(task, core)) {
                invalidTasks.push(task.name);
            }
        }
        
        if (invalidTasks.length != 0) {
            alert(`Tasks ${invalidTasks.join(', ')} are no longer valid.`);
        }
        
        return Promise.all(changedTasks.map(task => this.saveChangedTask(task)))
            .then(this.refreshViews());
    }
    
    refreshViews() {
        return Promise.all([this.getAllTasks(), this.modelCore.getAllCores()])
            .then(([tasks, cores]) => {
                const filteredTasks = tasks.filter(task => task.type === 'task');
                this.updateTasks(filteredTasks, cores)})
            .then(result => this.clearPreview())
            .then(result => this.modelCore.getAllCores())
            .then(result => this.updateCoreSelector(result))
            .then(result => this.modelDependency.validate());
    }
    
    toString() {
        return "ModelEntity";
    }
    
}

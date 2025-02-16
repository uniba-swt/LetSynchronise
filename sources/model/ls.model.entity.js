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

    deleteDelay(name) {
        if (name) {
            const encapsulation = `${name.source.task} => ${name.destination.task} encapsulation delay`;
            const network = `${name.source.task} => ${name.destination.task} network delay`;
            const decapsulation = `${name.source.task} => ${name.destination.task} decapsulation delay`;
    
            return this.database.deleteObject(Model.EntityInstancesStoreName, encapsulation)
                    .then(this.database.deleteObject(Model.EntityInstancesStoreName, network))
                    .then(this.database.deleteObject(Model.EntityInstancesStoreName, decapsulation))
        }
    }

    async deleteAllDelayInstances() {
        const allInstances = await this.getAllTaskInstances()
        let fileteredDelays = []
        fileteredDelays = allInstances.filter(instance => instance.name.includes("delay"))

        return fileteredDelays.map(delay => this.database.deleteObject(Model.EntityInstancesStoreName, delay.name))
    }

    deleteTask(name) {
        return this.database.deleteObject(Model.EntityStoreName, name)
            .then(this.database.deleteObject(Model.EntityInstancesStoreName, name))
            .then(result => this.refreshViews());
    }

    createDelayInstance(sourceEndTime, executionTime, sourceDevice, destDevice, dependency) {
        return {
            'instance'          : -1,
            'letStartTime'      : sourceEndTime,
            'letEndTime'        : sourceEndTime + executionTime,
            'executionTime'     : executionTime,
            'sourceDevice'      : sourceDevice.name,
            'destinationDevice' : destDevice.name,
            'dependency'        : dependency.name
        };
    }

    createAllDelayInstances(dependency, encapsulationDelays, networkDelays, decapsulationDelays) {
        this.createDelayInstances(dependency, "encapsulation", encapsulationDelays);
        this.createDelayInstances(dependency, "network", networkDelays);
        this.createDelayInstances(dependency, "decapsulation", decapsulationDelays);
    }

    createDelayInstances(dependency, type, delays) {
        let delayType = type.toLowerCase();
        let data = {}

        if (delayType === 'network') {
            data = {
                'name': `${dependency.source.task} => ${dependency.destination.task} ${delayType} delay`,
                'type': delayType,
                'dependency': dependency.name,
                'value': delays
            }
        } else if (delayType === 'encapsulation') {
            data = {
                'name': `${dependency.source.task} => ${dependency.destination.task} ${delayType} delay`,
                'type': delayType,
                'dependency': dependency.name,
                'value': delays
            }
        } else if (delayType === 'decapsulation') {
            data = {
                'name': `${dependency.source.task} => ${dependency.destination.task} ${delayType} delay`,
                'type': delayType,
                'dependency': dependency.name,
                'value': delays
            }
        }

        this.getAllTaskInstances().then(entities => {
            const delays = entities.filter(entity => entity.type !== 'task');

            let found = false;
            for (const delay of delays) {
                if (delay.name === data.name) {
                    found = true;

                    if (!delay.dependency.includes(data.dependency)) {
                        delay.dependency += `, ${data.dependency}`;
                        delay.value = [...delay.value, ...data.value];

                        delay.value.sort((first, second) => first.letStartTime - second.letStartTime);
                        delay.value.forEach((instance, index) => instance.instance = index);

                        this.database.putObject(Model.EntityInstancesStoreName, delay);
                    }
                    break;
                }
            }

            if (!found) {
                this.database.putObject(Model.EntityInstancesStoreName, data);
            }
        })

    }
    
    // Validate the tasks against the platform
    async validate() {
        const allCores = (await this.modelCore.getAllCores()).map(core => core.name);
        const allTasks = (await this.getAllTasks()).filter(task => task.type === 'task');
        
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

'use strict';

class ModelEntity {
    updateCoreSelector = null;          // Callback to function in ls.view.task
    updateTasks = null;                 // Callback to function in ls.view.task
    revalidateTaskParameters = null;    // Callback to function in ls.view.task
    clearPreview = null;                // Callback to function in ls.view.task
    notifyChanges = null;               // Callback to function in ls.view.schedule

    database = null;
    modelCore = null;
    modelDependency = null;
    modelEventChain = null;
        
    constructor() { }
    
    
    // -----------------------------------------------------
    // Static constants.
    
    static get EncapsulationName()      { return 'encapsulation'; }
    static get NetworkName()            { return 'network'; }
    static get DecapsulationName()      { return 'decapsulation'; }
    
    
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
    
    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }
    
    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    createEntity(parameters) {
        // Store entity parameters into Database.
        return this.database.putObject(Model.EntityStoreName, parameters)
            .then(result => this.refreshViews())
            .then(result => this.notifyChanges());
    }
    
    // Saves the changes to an existing task, without forcing the view to refresh.
    saveChangedTask(task) {
        return this.database.putObject(Model.EntityStoreName, task)
            .then(result => this.notifyChanges());
    }
    
    generateRandomTasks(parameters) {
        return Promise.all(Array.from({ length: parameters.numTasks}, (_, i) => this.generateRandomTask(parameters, i)));
    }
    
    generateRandomTask(parameters, i) {
        const period = parameters.periods[Utility.RandomInteger(0, null, parameters.periods.length - 1)];
        const initialOffset = Utility.RandomInteger(parameters.minInitialOffset, null, parameters.maxInitialOffset);
        
        // Min and max duration is a percentage of the chosen LET period.
        const duration = period * Utility.RandomInteger(parameters.minDuration, null, parameters.maxDuration).toPrecision(5) / 100;
        // Min and max utilisation is a percentage of the chosen LET duration.
        const wcet = duration * Utility.RandomInteger(parameters.minUtilisation, null, parameters.maxUtilisation).toPrecision(5) / 100;
        const bcet = Utility.RandomInteger(0, null, wcet).toPrecision(5) / 1;
        const acet = (wcet + bcet) / 2;
        
        return this.createEntity({
            'type'            : 'task',
            'name'            : `t${i}`,
            'priority'        : null,
            'initialOffset'   : initialOffset,
            'activationOffset': 0,
            'duration'        : duration,
            'period'          : period,
            'inputs'          : [ 'in1' ],
            'outputs'         : [ 'out1' ],
            'wcet'            : wcet,
            'acet'            : acet,
            'bcet'            : bcet,
            'distribution'    : 'Normal',
            'core'            : null
        });
    }
    
    getAllEntities() {
        return this.database.getAllObjects(Model.EntityStoreName);
    }

    getEntity(entity) {
        return this.database.getObject(Model.EntityStoreName, entity);
    }
    
    getAllEntitiesInstances() {
        return this.database.getAllObjects(Model.EntityInstancesStoreName);
    }
    
    getAllTasks() {
        return this.getAllEntities()
            .then(result => result.filter(entity => entity.type == 'task'));
    }
    
    getAllTaskInstances() {
        return this.getAllEntityinstances()
            .then(result => result.filter(instance => instance.type == 'task'));
    }

    deleteEntity(name) {
        return this.database.deleteObject(Model.EntityStoreName, name)
            .then(result => this.database.deleteObject(Model.EntityInstancesStoreName, name))
            .then(result => this.refreshViews())
            .then(result => this.notifyChanges());
    }

    static CreateDelayEntityInstanceParameters(instance, sourceEndTime, executionTime, sourceDevice, destDevice, dependency) {
        return {
            'instance'          : instance,
            'letStartTime'      : sourceEndTime,
            'letEndTime'        : sourceEndTime + executionTime,
            'executionTime'     : executionTime,
            'sourceDevice'      : sourceDevice.name,
            'destinationDevice' : destDevice.name,
            'dependency'        : dependency.name
        };
    }
    
    createDelayEntityInstance(dependency, type, delays) {
        let delayType = type.toLowerCase();
        
        switch (delayType) {
            case ModelEntity.EncapsulationName:
            case ModelEntity.NetworkName:
            case ModelEntity.DecapsulationName:
            return this.database.putObject(Model.EntityInstancesStoreName, {
                'name'       : `${dependency.source.task} => ${dependency.destination.task} ${delayType} delay`,
                'type'       : delayType,
                'dependency' : dependency.name,
                'value'      : delays
            });
        default:
            return null;
        }
    }
    
    createAllDelayEntityInstances(dependency, encapsulationDelays, networkDelays, decapsulationDelays) {
    	return Promise.all([
			this.createDelayEntityInstance(dependency, ModelEntity.EncapsulationName, encapsulationDelays),
			this.createDelayEntityInstance(dependency, ModelEntity.NetworkName, networkDelays),
			this.createDelayEntityInstance(dependency, ModelEntity.DecapsulationName, decapsulationDelays)
    	]);
    }

    deleteAllDelayEntityInstances() {
        return this.getAllEntitiesInstances()
            .then(result => result.filter(instance => instance.type == ModelEntity.EncapsulationName || instance.type == ModelEntity.NetworkName || instance.type == ModelEntity.DecapsulationName))
            .then(result => Promise.all(result.map(delay => this.database.deleteObject(Model.EntityInstancesStoreName, delay.name))));
    }
    
    // Validate the entities against the platform.
    async validate() {
        const allCores = (await this.modelCore.getAllCores()).map(core => core.name);
        const allTasks = await this.getAllTasks();
        
        let changedTasks = [];
        let invalidTasks = [];
        for (const task of allTasks) {
            if (task.core != null && !allCores.includes(task.core)) {
                task.core = null;
                changedTasks.push(this.saveChangedTask(task));
            }
            
            const core = await this.modelCore.getCore(task.core);
            if (!this.revalidateTaskParameters(task, core)) {
                invalidTasks.push(task.name);
            }
        }
        
        if (invalidTasks.length != 0) {
            alert(`Tasks ${invalidTasks.join(', ')} are no longer valid, e.g., because their WCET now exceeds their LET duration.`);
        }
        
        return Promise.all(changedTasks)
            .then(result => this.refreshViews());
    }
    
    refreshViews() {
        return Promise.all([this.getAllTasks(), this.modelCore.getAllCores()])
            .then(([tasks, cores]) => this.updateTasks(tasks, cores))
            .then(result => this.clearPreview())
            .then(result => this.modelCore.getAllCores())
            .then(result => this.updateCoreSelector(result))
            .then(result => this.modelDependency.validate());
    }
    
    toString() {
        return "ModelEntity";
    }
    
}

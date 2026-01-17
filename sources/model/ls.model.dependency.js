'use strict';

class ModelDependency {
    updateDependencies = null;             // Callback to function in ls.view.dependency
    updateDependencySelectors = null;      // Callback to function in ls.view.dependency
    
    database = null;
    modelEntity = null;
    modelInterface = null;
    modelEventChain = null;
    modelCore = null;

    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateDependenciesCallback(callback) {
        this.updateDependencies = callback;
    }

    registerUpdateDependencySelectorsCallback(callback) {
        this.updateDependencySelectors = callback;
    }
        

    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }
    
    registerModelEntity(modelEntity) {
        this.modelEntity = modelEntity;
    }
    
    registerModelInterface(modelInterface) {
        this.modelInterface = modelInterface;
    }

    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
    }

    registerModelCore(modelCore) {
        this.modelCore = modelCore;
    }
        
    
    // -----------------------------------------------------
    // Class methods

    createDependency(dependency) {
        // Store dependency in Database
        return this.database.putObject(Model.DependencyStoreName, dependency)
            .then(result => this.refreshViews());
    }

    generateRandomDependency(tasks, sourceIndex, destinationIndex) {
        const sourceTask = tasks[sourceIndex];
        const sourceTaskOutputs = sourceTask.outputs;
        const sourceTaskOutput = sourceTaskOutputs[Utility.RandomInteger(0, null, sourceTaskOutputs.length - 1)];
        
        const destinationTask = tasks[destinationIndex];
        const destinationTaskInputs = destinationTask.inputs;
        const destinationTaskInput = destinationTaskInputs[Utility.RandomInteger(0, null, destinationTaskInputs.length - 1)];
        
        return this.createDependency({
            'name'        : `dep-${tasks[sourceIndex].name}→${tasks[destinationIndex].name}`,
            'source'      : {
                'port'    : sourceTaskOutput,
                'task'    : sourceTask.name
            },
            'destination' : {
                'port'    : destinationTaskInput,
                'task'    : destinationTask.name
            }
        });
    }
    
    async generateRandomDependencies(numDependencies) {
        const tasks = await this.modelEntity.getAllTasks();
        
        let dependencies = [];
        for (let i = 0; i < numDependencies; ++i) {
            const sourceIndex = Utility.RandomInteger(0, null, tasks.length - 1);
            const destinationIndex = (sourceIndex + Utility.RandomInteger(1, null, tasks.length - 1)) % tasks.length;
            dependencies.push(this.generateRandomDependency(tasks, sourceIndex, destinationIndex));
        }
        
        return Promise.all(dependencies);
    }
    
    static CreateDelayDependencyParameters(dependency, delayType) {
        switch (delayType) {
            case ModelEntity.EncapsulationName:
                return {
                    'source'      : {'task': dependency.source.task, 'port': dependency.source.port},
                    'destination' : {'task': `${dependency.source.task} => ${dependency.destination.task} ${ModelEntity.EncapsulationName} delay`, 'port': dependency.destination.port}
                };
                
            case ModelEntity.NetworkName:
                return {
                    'source'      : {'task': `${dependency.source.task} => ${dependency.destination.task} ${ModelEntity.EncapsulationName} delay`, 'port': dependency.source.port},
                    'destination' : {'task': `${dependency.source.task} => ${dependency.destination.task} ${ModelEntity.NetworkName} delay`, 'port': dependency.destination.port}
                };
                
            case ModelEntity.DecapsulationName:
                return {
                    'source'      : {'task': `${dependency.source.task} => ${dependency.destination.task} ${ModelEntity.NetworkName} delay`, 'port': dependency.source.port},
                    'destination' : {'task': `${dependency.source.task} => ${dependency.destination.task} ${ModelEntity.DecapsulationName} delay`, 'port': dependency.destination.port}
                };
            default:
                return {
                    'source'      : {'task': `${dependency.source.task} => ${dependency.destination.task} ${ModelEntity.DecapsulationName} delay`, 'port': dependency.source.port},
                    'destination' : {'task': dependency.destination.task, 'port': dependency.destination.port}
                };
        }
    }
    
    getDependency(name) {
        return this.database.getObject(Model.DependencyStoreName, name);
    }
    
    getAllDependencies() {
        return this.database.getAllObjects(Model.DependencyStoreName);
    }
    
    getAllDependencyInstances() {
        return this.database.getAllObjects(Model.DependencyInstancesStoreName);
    }

    deleteDependency(name) {
        return this.database.deleteObject(Model.DependencyInstancesStoreName, name)
            .then(this.database.deleteObject(Model.DependencyStoreName, name))
            .then(this.refreshViews());
    }
    
    deleteAllDependencies() {
        return this.database.deleteAllObjects(Model.DependencyInstancesStoreName)
            .then(this.database.deleteAllObjects(Model.DependencyStoreName))
            .then(this.refreshViews());
    }
    
    getSuccessorDependencies(name) {
        const promiseDependency = this.getDependency(name);
        const promiseAllDependencies = promiseDependency.then(sourceDependency => {
            return (sourceDependency.destination.task == Model.SystemInterfaceName) ? [] : this.getAllDependencies();
        });
        
        return Promise.all([promiseDependency, promiseAllDependencies])
            .then(([sourceDependency, allDependencies]) => allDependencies
                .filter(dependency => (dependency.source.task == sourceDependency.destination.task)));
    }
    
    // Validate entity dependencies against system and entity inputs and outputs.
    async validate() {
        // Get all the available inputs and outputs.
        let allSources = { };
        let allDestinations = { };
        (await this.modelEntity.getAllEntities()).map(entity => {
            allSources[entity.name] = entity.outputs;
            allDestinations[entity.name] = entity.inputs;
        });

        allSources[Model.SystemInterfaceName] = (await this.modelInterface.getAllInputs()).map(port => port.name);
        allDestinations[Model.SystemInterfaceName] = (await this.modelInterface.getAllOutputs()).map(port => port.name);

        // Check dependencies to remove.
        let dependenciesToRemove = [];
        const allDependencies = await this.getAllDependencies();
        for (const dependency of allDependencies) {
            if (!allSources.hasOwnProperty(dependency.source.task) || !allDestinations.hasOwnProperty(dependency.destination.task)) {
                dependenciesToRemove.push(dependency);
            } else if (!allSources[dependency.source.task].includes(dependency.source.port) || !allDestinations[dependency.destination.task].includes(dependency.destination.port)) {
                dependenciesToRemove.push(dependency);
            }
        }
        
        return Promise.all(dependenciesToRemove.map(dependency => this.deleteDependency(dependency.name)))
            .then(this.refreshViews());
    }

    refreshViews() {
        return this.getAllDependencies()
            .then(result => this.updateDependencies(result))
            .then(result => Promise.all([this.modelEntity.getAllTasks(), this.modelInterface.getAllInputs(), this.modelInterface.getAllOutputs()]))
            .then(([tasks, systemInputs, systemOutputs]) => this.updateDependencySelectors(tasks, systemInputs, systemOutputs))
            .then(result => this.modelEventChain.validate());
    }

    toString() {
        return "ModelDependency";
    }
}

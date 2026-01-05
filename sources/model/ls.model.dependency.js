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
            .then(() => this.refreshViews());
    }

    createDelayDependency(dependency, delayType) {
        if (delayType === 'encapsulation') {
            return {
                'source': {'task': dependency.source.task, 'port': dependency.source.port},
                'destination': {'task': `${dependency.source.task} => ${dependency.destination.task} ${delayType} delay`, 'port': dependency.destination.port}
            }
        } else if (delayType === 'network') {
            return {
                'source': {'task': `${dependency.source.task} => ${dependency.destination.task} encapsulation delay`, 'port': dependency.source.port},
                'destination': {'task': `${dependency.source.task} => ${dependency.destination.task} ${delayType} delay`, 'port': dependency.destination.port}
            }
        } else if (delayType === 'decapsulation') {
            return {
                'source': {'task': `${dependency.source.task} => ${dependency.destination.task} network delay`, 'port': dependency.source.port},
                'destination': {'task': `${dependency.source.task} => ${dependency.destination.task} ${delayType} delay`, 'port': dependency.destination.port}
            }
        } else {
            return {
                'source': {'task': `${dependency.source.task} => ${dependency.destination.task} decapsulation delay`, 'port': dependency.source.port},
                'destination': {'task': dependency.destination.task, 'port': dependency.destination.port}
            }
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

    async generateRandomDependencies(numDependencies) {
        const tasks = await this.modelEntity.getAllTasks();

        let dependencies = [];
        const limit = tasks.length * (tasks.length - 1)

        while (dependencies.length < numDependencies && dependencies.length < limit) {
            let sourceIndex = Utility.RandomInteger(0, null, tasks.length);
            let destinationIndex = 0;

            let flag = true;
            while(flag) {
                destinationIndex = Utility.RandomInteger(0, null, tasks.length);

                if (destinationIndex != sourceIndex) {
                    flag = false;
                }
            }

            dependencies.push(this.createRandomDependencies(tasks, sourceIndex, destinationIndex));
            console.log(dependencies.length)
        }

        console.log(dependencies)

        return Promise.all(dependencies.map(dependency => this.createDependency(dependency)));
    }

    createRandomDependencies(tasks, sourceIndex, destinationIndex) {
        return {
            name: `dep_${sourceIndex + 1}-to-${destinationIndex + 1}`,
            source: {
                port: "out1",
                task: tasks[sourceIndex].name
            },
            destination: {
                port: "in1",
                task: tasks[destinationIndex].name
            }
        }
    }
    
    // Validate task dependencies against system and task inputs and outputs.
    async validate() {
        // Get all the available inputs and outputs.
        let allSources = { };
        let allDestinations = { };
        (await this.modelEntity.getAllTasks()).map(task => {
            allSources[task.name] = task.outputs;
            allDestinations[task.name] = task.inputs;
        });

        allSources[Model.SystemInterfaceName] = (await this.modelInterface.getAllInputs()).map(port => port.name);
        allDestinations[Model.SystemInterfaceName] = (await this.modelInterface.getAllOutputs()).map(port => port.name);

        // Check dependencies to remove.
        let dependenciesToRemove = [];
        const allDependencies = await this.getAllDependencies();
        for (const dependency of allDependencies) {
            if (!allSources.hasOwnProperty(dependency.source.task)
                  || !allDestinations.hasOwnProperty(dependency.destination.task)) {
                dependenciesToRemove.push(dependency);
            } else if (!allSources[dependency.source.task].includes(dependency.source.port)
                         || !allDestinations[dependency.destination.task].includes(dependency.destination.port)) {
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

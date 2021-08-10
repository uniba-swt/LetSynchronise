'use strict';

class ModelConstraint {
    updateConstraints = null;      // Callback to function in ls.view.constraint
    updateConstraintSelectors = null;
    
    database = null;
    modelTask = null;
    modelInterface = null;
    
    constructor() { }
    
    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerUpdateConstraintsCallback(callback) {
        this.updateConstraints = callback;
    }
    
    registerUpdateConstraintSelectorsCallback(callback) {
        this.updateConstraintSelectors = callback;
    }
    
    
    // -----------------------------------------------------
    // Registration of model database
    
    registerModelDatabase(database) {
        this.database = database;
    }
    
    registerModelTask(modelTask) {
        this.modelTask = modelTask;
    }
    
    registerModelInterface(modelInterface) {
        this.modelInterface = modelInterface;
    }
    
    
    // -----------------------------------------------------
    // Class methods

    createConstraint(constraint) {
        // Store constraint into Database
        return this.database.putObject(Model.ConstraintStoreName, constraint)
            .then(this.refreshViews());
    }
    
    getAllConstraints() {
        return this.database.getAllObjects(Model.ConstraintStoreName);
    }
    
    getConstraint(name) {
        return this.database.getObject(Model.ConstraintStoreName, name);
    }

    deleteConstraint(name) {
        return this.database.deleteObject(Model.ConstraintStoreName, name)
            .then(this.database.deleteObject(Model.ConstraintInstancesStoreName, name))
            .then(this.refreshViews());
    }
    
    deleteAllConstraints() {
        return this.database.deleteAllObjects(Model.ConstraintStoreName)
            .then(this.database.deleteAllObjects(Model.ConstraintInstancesStoreName))
            .then(this.refreshViews());
    }
    
    deleteConstraintsOfTask(taskName) {
        return this.getAllConstraints()
            .then(constraints => {
                let deletePromises = [];
                for (const constraint of constraints) {
                    if (constraint.destination.task == taskName || constraint.source.task == taskName) {
                        deletePromises.push(this.deleteConstraint(constraint.name));
                    }
                }
                
                return Promise.all(deletePromises);
            });
    }
    
    deleteConstraintsOfSystem(portName) {
        return this.getAllConstraints()
            .then(constraints => {
                let deletePromises = [];
                for (const constraint of constraints) {
                    if (constraint.destination.task == Model.SystemInterfaceName || constraint.source.task == Model.SystemInterfaceName) {
                        if (constraint.destination.port == portName || constraint.source.port == portName) {
                            deletePromises.push(this.deleteConstraint(constraint.name));
                        }
                    }
                }
                
                return Promise.all(deletePromises);
            });
    }
    
    refreshViews() {
        return this.getAllConstraints()
            .then(result => this.updateConstraints(result))
            .then(result => Promise.all([this.modelTask.getAllTasks(), this.modelInterface.getAllInputs(), this.modelInterface.getAllOutputs()]))
            .then(([tasks, systemInputs, systemOutputs]) => this.updateConstraintSelectors(tasks, systemInputs, systemOutputs));
    }
    
    toString() {
        return "ModelConstraints";
    }
}

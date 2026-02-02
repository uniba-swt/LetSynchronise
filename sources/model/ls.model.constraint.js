'use strict';

class ModelConstraint {
    updateConstraints = null;              // Callback to function in ls.view.constraint
    updateConstraintSelectors = null;      // Callback to function in ls.view.constraint
    
    database = null;
    modelEventChain = null;
    
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

    registerModelEventChain(modelEventChain) {
        this.modelEventChain = modelEventChain;
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
    
    
    // Validate constraints against event chains.
    validate() {
        return Promise.all([this.getAllConstraints(), this.modelEventChain.getAllEventChains()])
            .then(([allConstraints, allEventChains]) => [allConstraints, allEventChains.map(eventChain => eventChain.name)])
            .then(([allConstraints, allEventChains]) => allConstraints.filter(constraint => (!allEventChains.includes(constraint.eventChain))))
            .then(constraintsToDelete => Promise.all(constraintsToDelete.map(constraint => this.deleteConstraint(constraint.name))))
            .then(this.refreshViews());
    }
    
    refreshViews() {
        return this.getAllConstraints()
            .then(result => this.updateConstraints(result))
            .then(result => this.modelEventChain.getAllEventChains())
            .then(result => this.updateConstraintSelectors(result));
    }
    
    toString() {
        return "ModelConstraint";
    }
}

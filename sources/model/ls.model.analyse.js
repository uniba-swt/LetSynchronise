
'use strict';

class ModelAnalyse {
    updateAnalysis = null;    // Callback to function in ls.view.analyse
    
    modelDependency = null;
    modelConstraint = null;
    modelTask = null;
    constructor() { }

    
    // -----------------------------------------------------
    // Registration of callbacks from the controller
    
    registerAnalyseCallback(callback) {
        this.updateAnalysis = callback;
    }
    
    
    // -----------------------------------------------------
    // Registration of model database
    
    registerModelTask(modelTask) {
        this.modelTask = modelTask;
    }

    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }
    registerModelConstraint(modelConstraint) {
        this.modelConstraint = modelConstraint;
    }

    async analyse() {
        let tasks = await this.modelTask.getAllTasks();
        let constraints = await this.modelConstraint.getAllConstraints();
        let dependencies = await this.modelDependency.getAllDependencies();
        console.log("Analyse Model");
        /*console.log(tasks);
        console.log(constraints);*/
        console.log(dependencies);

        /*hardcoded chain for testing and development*/
        let chain = new ChainNode(dependencies[0]);
        let child = chain.addChildrenDependency(dependencies[1]).addChildrenDependency(dependencies[2]);

        console.log(chain.toString());
        this.updateAnalysis();
        
    }

    toString() {
        return "ModelAnalyse";
    }
}
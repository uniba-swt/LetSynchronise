'use strict';

class ModelTask {
    constructor() { }
    
    createTask(taskParameters) {
        alert("ModelTask.createTask()");
        console.log(taskParameters);
    }
    
    toString() {
        return "ModelTask";
    }
}

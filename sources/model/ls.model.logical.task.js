'use strict';

class ModelLogicalTask {
    /// -----------------------------------------------------
    constructor(name, initialOffset, activationOffset, period, duration, inputPorts, outputPorts) {
        this.name = name;
        this.initialOffset = initialOffset;
        this.activationOffset = activationOffset;
        this.period = period;
        this.duration = duration;
        this.inputs = inputPorts;
        this.outputs = outputPorts;
    }
    
    static CreateWithTaskParameters(taskParameters) {
        return new ModelLogicalTask(taskParameters.name, taskParameters.initialOffset, taskParameters.activationOffset, taskParameters.period, taskParameters.duration, taskParameters.inputs, taskParameters.outputs);
    }

    getTaskParameters = function() {
        let taskParameters = {
            'name': this.name, 
            'initialOffset': this.initialOffset,
            'activationOffset': this.activationOffset,
            'duration': this.duration,
            'period': this.period,
            'inputs': this.inputs,
            'outputs': this.outputs
        };
        return taskParameters;
    }
}



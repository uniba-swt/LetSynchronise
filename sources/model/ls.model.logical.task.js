'use strict';

class ModelLogicalTask {
    name = null;
    initialOffset = null;
    activationOffset = null;
    period = null;
    duration = null;
    inputs = null;
    outputs = null;

    constructor(name, initialOffset, activationOffset, period, duration, inputs, outputs) {
        this.name = name;
        this.initialOffset = initialOffset;
        this.activationOffset = activationOffset;
        this.period = period;
        this.duration = duration;
        this.inputs = inputs;
        this.outputs = outputs;
    }
    
    static CreateWithTaskParameters(taskParameters) {
        return new ModelLogicalTask(taskParameters.name, taskParameters.initialOffset, taskParameters.activationOffset, taskParameters.period, taskParameters.duration, taskParameters.inputs, taskParameters.outputs);
    }

    get taskParameters() {
        return {
            'name': this.name, 
            'initialOffset': this.initialOffset,
            'activationOffset': this.activationOffset,
            'duration': this.duration,
            'period': this.period,
            'inputs': this.inputs,
            'outputs': this.outputs
        };
    }
}



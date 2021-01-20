'use strict';

class ViewDependencies {
    root = null;
    
    taskDependencyInput = null;
    taskDependencyOutput = null;
    
    addButton = null;
    
    taskDependencies = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-design');
        
        // Define or edit task dependencies
        this.taskDependencyInput = this.root.querySelector('#view-task-dependencies-input');
        this.taskDependencyOutput = this.root.querySelector('#view-task-dependencies-output');
        
        this.addButton = this.root.querySelector('#add');
        
        this.taskDependencies = d3.select('#view-task-dependencies');
    }
    
    
    get dependencyInput() {
        return this.taskDependencyInput.value;
    }
    
    get dependencyOutput() {
        return this.taskDependencyOutput.value;
    }
    
    get taskDependencyRaw() {
        return {
            'input': this.dependencyInput,
            'output': this.dependencyOutput
        };
    }
    
    get taskDependencyClean() {
        const input = this.dependencyInput.split('.');
        const output = this.dependencyOutput.split('.');
        return {
            'input': {
                'task': input[0],
                'port': input[1]
            },
            'output': {
                'task': output[0],
                'port': output[1]
            }
        };
    }
    
    
    registerAddHandler(handler) {
        this.addButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the inputs.
            if (this.validateTaskDependency(this.taskDependencyRaw)) {
                // Call the handler.
                handler(this.taskDependencyClean);
            }
        });
    }
    
    validateTaskDependency(taskDependency) {
        if (taskDependency.input == 'null ') {
            alert(`Choose an input dependency.`);
            return false;
        }
        
        if (taskDependency.output == 'null ') {
            alert(`Choose an output dependency.`);
            return false;
        }
        
        return true;
    }
    
    updateDependencySelectors(taskParametersSet) {
        const inputs = taskParametersSet.map(taskParameters => this.taskPorts(taskParameters.name, taskParameters.inputs)).flat();
        const outputs = taskParametersSet.map(taskParameters => this.taskPorts(taskParameters.name, taskParameters.outputs)).flat();
        
        // Create list of available inputs and outputs
        this.updateTaskDependencyPorts(d3.select(this.taskDependencyInput), inputs);
        this.updateTaskDependencyPorts(d3.select(this.taskDependencyOutput), outputs);
    }
        
    updateTaskDependencyPorts(parentElement, ports) {
        // Create list of available ports
        parentElement.selectAll('*').remove();
        parentElement
            .append('option')
                .property('disabled', true)
                .property('selected', true)
                .property('hidden', true)
                .attr('value', 'null ')
                .text('Choose...');
        
        ports.forEach(port =>
            parentElement
                .append('option')
                    .attr('value', port)
                    .text(port)
        );
    }
    
    updateDependencies(dependencies) {
        // Display existing task dependencies
        this.taskDependencies.selectAll('*').remove();
        
        this.taskDependencies
            .selectAll('li')
            .data(dependencies)
            .enter()
            .append('li')
                .text(dependency => `${dependency.output} --> ${dependency.input}`);
    }

    taskPorts(taskName, taskPorts) {
        return taskPorts.map(port => `${taskName}.${port}`);
    }
    
    toString() {
        return "ViewDependencies";
    }
}

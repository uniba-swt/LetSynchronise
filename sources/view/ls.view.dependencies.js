'use strict';

class ViewDependencies {
    root = null;
    
    taskDependencyName = null;
    taskDependencySource = null;
    taskDependencyDestination = null;
    
    addButton = null;
    
    taskDependencies = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-design');
        
        // Define or edit task dependencies
        this.taskDependencyName = this.root.querySelector('#view-task-dependencies-name');
        this.taskDependencySource = this.root.querySelector('#view-task-dependencies-source');
        this.taskDependencyDestination = this.root.querySelector('#view-task-dependencies-destination');
        
        this.addButton = this.root.querySelector('#add');
        
        this.taskDependencies = d3.select('#view-task-dependencies');
    }
    
    
    get dependencyName() {
        return this.taskDependencyName.value;
    }
    
    get dependencySource() {
        return this.taskDependencySource.value;
    }
    
    get dependencyDestination() {
        return this.taskDependencyDestination.value;
    }
    
    get taskDependencyRaw() {
        return {
            'name': this.dependencyName,
            'source': this.dependencySource,
            'destination': this.dependencyDestination
        };
    }
    
    get taskDependencyClean() {
        const source = this.dependencySource.split('.');
        const destination = this.dependencyDestination.split('.');
        return {
            'name': this.dependencyName.trim(),
            'source': {
                'task': source[0],
                'port': source[1]
            },
            'destination': {
                'task': destination[0],
                'port': destination[1]
            }
        };
    }
    
    
    // -----------------------------------------------------
    // Registration of handlers from the controller

    registerAddHandler(handler) {
        this.addButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the destinations.
            if (this.validateTaskDependency(this.taskDependencyRaw)) {
                // Call the handler.
                handler(this.taskDependencyClean);
            }
        });
    }
    
    validateTaskDependency(taskDependency) {
        if (taskDependency.name == null || taskDependency.name.trim() == '') {
            alert('Name cannot be blank.');
            return false;
        }

        if (taskDependency.source == 'null ') {
            alert(`Choose source of dependency.`);
            return false;
        }

        if (taskDependency.destination == 'null ') {
            alert(`Choose destination of dependency.`);
            return false;
        }
                
        return true;
    }
    
    updateDependencySelectors(taskParametersSet) {
        const sources = taskParametersSet.map(taskParameters => this.taskPorts(taskParameters.name, taskParameters.outputs)).flat();
        const destinations = taskParametersSet.map(taskParameters => this.taskPorts(taskParameters.name, taskParameters.inputs)).flat();
        
        // Create list of available sources and destinations
        this.updateTaskDependencyPorts(d3.select(this.taskDependencySource), sources);
        this.updateTaskDependencyPorts(d3.select(this.taskDependencyDestination), destinations);
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
                .text(dependency => `${dependency.name}: ${dependency.source} --> ${dependency.destination}`);
    }

    taskPorts(taskName, taskPorts) {
        return taskPorts.map(port => `${taskName}.${port}`);
    }
    
    toString() {
        return "ViewDependencies";
    }
}

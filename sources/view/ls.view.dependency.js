'use strict';

class ViewDependency {
    root = null;
    
    nameField = null;
    sourceField = null;
    destinationField = null;
    
    submitButton = null;
    
    taskDependencies = null;
    
    deleteHandler = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-design');
        
        // Define or edit task dependency
        this.nameField = this.root.querySelector('#view-task-dependency-name');
        this.sourceField = this.root.querySelector('#view-task-dependency-source');
        this.destinationField = this.root.querySelector('#view-task-dependency-destination');
        
        this.submitButton = this.root.querySelector('#submitDependency');
        
        this.taskDependencies = d3.select('#view-task-dependencies');
    }
    
    
    get name() {
        return this.nameField.value;
    }
    
    set name(name) {
        this.nameField.value = name;
    }
    
    get source() {
        return this.sourceField.value;
    }
    
    set source(source) {
        this.sourceField.value = source;
    }
    
    get destination() {
        return this.destinationField.value;
    }
    
    set destination(destination) {
        this.destinationField.value = destination;
    }
    
    get dependencyRaw() {
        return {
            'name': this.name,
            'source': this.source,
            'destination': this.destination
        };
    }
    
    get dependencyClean() {
        const source = this.source.split('.');
        const destination = this.destination.split('.');
        return {
            'name': this.name.trim(),
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
    // Setup listeners
    
    setupDeleteButtonListener(elementId) {
        const deleteButton = this.root.querySelector(`[id='${elementId}']`);
        
        deleteButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Call the handler.
            this.deleteHandler(elementId);
        });
    }
    
    
    // -----------------------------------------------------
    // Registration of handlers from the controller

    registerSubmitHandler(handler) {
        this.submitButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the destinations.
            if (this.validateTaskDependency(this.dependencyRaw)) {
                // Call the handler.
                handler(this.dependencyClean);
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
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
        
        if (taskDependency.source.includes(Model.SystemInterfaceName) && taskDependency.destination.includes(Model.SystemInterfaceName)) {
			alert('Source and destination of dependency cannot both be from the system.')
        	return false;
        }
                
        return true;
    }
    
    updateDependencySelectors(taskParametersSet, systemInputs, systemOutputs) {
        const sources = taskParametersSet.map(taskParameters => Utility.TaskPorts(taskParameters.name, taskParameters.outputs)).flat();
        const destinations = taskParametersSet.map(taskParameters => Utility.TaskPorts(taskParameters.name, taskParameters.inputs)).flat();
        
        // Create list of available sources and destinations
        this.updateTaskDependencyPorts(d3.select(this.sourceField), sources, systemInputs);
        this.updateTaskDependencyPorts(d3.select(this.destinationField), destinations, systemOutputs);
    }
        
    updateTaskDependencyPorts(parentElement, taskPorts, systemPorts) {
        // Create list of available ports
        parentElement.selectAll('*').remove();
        parentElement
            .append('option')
                .property('disabled', true)
                .property('selected', true)
                .property('hidden', true)
                .attr('value', 'null ')
                .text('Choose ...');
        
        systemPorts.forEach(port =>
            parentElement
                .append('option')
                    .attr('value', `${Model.SystemInterfaceName}.${port.name}`)
                    .text(port.name)
        );
        
        taskPorts.forEach(port =>
            parentElement
                .append('option')
                    .attr('value', port)
                    .text(port)
        );
    }
    
    updateDependencies(rawDependencies) {
        // Display task dependencies
        const dependencies = Utility.FormatDependencies(rawDependencies);
        this.taskDependencies.selectAll('*').remove();
        
        const thisRef = this;
        
        this.taskDependencies
            .selectAll('li')
            .data(dependencies)
            .enter()
            .append('li')
                .html(dependency => `<span>${dependency.name}: ${dependency.source} &rarr; ${dependency.destination}</span> ${Utility.AddDeleteButton(dependency.name)}`)
            .on('click', function(data) {
                thisRef.taskDependencies.node().querySelectorAll('li')
                    .forEach((dependency) => {
                        if (dependency !== this) { dependency.classList.remove('dependencySelected'); }
                    });
                this.classList.toggle('dependencySelected');
                thisRef.populateParameterForm.bind(thisRef)(data);
            });

        for (const dependency of dependencies) {
            this.setupDeleteButtonListener(`${dependency.name}`);
        }
    }
    
    populateParameterForm(dependency) {
        this.name = dependency.name;
        this.source = dependency.sourceFull;
        this.destination = dependency.destinationFull;
    }
    
    toString() {
        return "ViewDependency";
    }
}

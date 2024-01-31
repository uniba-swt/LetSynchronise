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

    registerSubmitHandler(handlerCreateDependency, handlerGetSystemInterface) {
        this.submitButton.addEventListener('click', async (event) => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();

            // Validate the destinations.
            const [systemInputs, systemOutputs] = await handlerGetSystemInterface();
            if (this.validateTaskDependency(this.dependencyRaw, systemInputs, systemOutputs)) {
                // Call the handler.
                handlerCreateDependency(this.dependencyClean);
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
    }
    
    validateTaskDependency(taskDependency, systemInputs, systemOutputs) {
        if (taskDependency.name == null || taskDependency.name.trim() == '') {
            alert('Task dependency name cannot be blank.');
            return false;
        }
        if (!Utility.ValidName(taskDependency.name.trim())) {
            alert('Task dependency name can only start with an alphabetical or underscore character, and continue with alphanumerical or underscore characters.');
            return false;
        }
        if (systemInputs.includes(taskDependency.name)) {
            alert(`Task dependency name cannot be the same as a system input.`);
            return false;
        }
        if (systemOutputs.includes(taskDependency.name)) {
            alert(`Task dependency name cannot be the same as a system output.`);
            return false;
        }
        
        if (taskDependency.source == 'null ') {
            alert('Choose source of dependency.');
            return false;
        }

        if (taskDependency.destination == 'null ') {
            alert('Choose destination of dependency.');
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
        this.updateTaskDependencyPorts(d3.select(this.sourceField), sources.sort(), systemInputs.sort());
        this.updateTaskDependencyPorts(d3.select(this.destinationField), destinations.sort(), systemOutputs.sort());
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
                .html(dependency => `<span><b>${dependency.name}:</b> ${dependency.source} ${View.ArrowSeparator} ${dependency.destination}</span> ${Utility.AddDeleteButton(dependency.name)}`)
            .on('click', function(event, data) {
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

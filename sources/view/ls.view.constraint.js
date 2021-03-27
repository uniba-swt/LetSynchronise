'use strict';

class ViewConstraint {
    root = null;
    
    nameField = null;
    sourceField = null;
    destinationField = null;
    relationField = null;
    timeField = null;
    
    submitButton = null;
    
    constraints = null;
    
    deleteHandler = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        // Define or edit constraint
        this.nameField = this.root.querySelector('#view-analyse-constraint-name');
        this.sourceField = this.root.querySelector('#view-analyse-constraint-source');
        this.destinationField = this.root.querySelector('#view-analyse-constraint-destination');
        this.relationField = this.root.querySelector('#view-analyse-constraint-relation');
        this.timeField = this.root.querySelector('#view-analyse-constraint-time');

        this.submitButton = this.root.querySelector('#submitConstraint');
        
        this.constraints = d3.select('#view-analyse-constraints');
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
    
    get relation() {
        return this.relationField.value;
    }
    
    set relation(relation) {
        this.relationField.value = relation;
    }
    
    get time() {
        return this.timeField.value;
    }

    set time(time) {
        this.timeField.value = time;
    }
    
    get constraintRaw() {
        return {
            'name': this.name,
            'source': this.source,
            'destination': this.destination,
            'relation': this.relation,
            'time': this.time
        };
    }
    
    get constraintClean() {
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
            },
            'relation': this.relation.trim(),
            'time': parseFloat(this.time)
        };
    }
    
    
    // -----------------------------------------------------
    // Setup listeners
    
    setupDeleteButtonListener(elementId) {
        const deleteButton = this.root.querySelector(`#${elementId}`);
        
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
            if (this.validateConstraint(this.constraintRaw)) {
                // Call the handler.
                handler(this.constraintClean);
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
    }
    
    
    validateConstraint(constraint) {
        if (constraint.name == null || constraint.name.trim() == '') {
            alert('Name cannot be blank.');
            return false;
        }

        if (constraint.source == 'null ') {
            alert('Choose source of constraint.');
            return false;
        }

        if (constraint.destination == 'null ') {
            alert('Choose destination of constraint.');
            return false;
        }
        
        if (constraint.relation == 'null ') {
            alert('Choose relation of constraint.');
            return false;
        }
        
        if (constraint.time == null || constraint.time.trim() == '') {
            alert('Time cannot be blank.');
            return false;
        }
                
        return true;
    }
    
    updateConstraintSelectors(taskParametersSet) {
        const sources = taskParametersSet.map(taskParameters => Utility.TaskPorts(taskParameters.name, taskParameters.outputs)).flat();
        const destinations = taskParametersSet.map(taskParameters => Utility.TaskPorts(taskParameters.name, taskParameters.inputs)).flat();
        
        // Create list of available sources and destinations
        this.updateConstraintPorts(d3.select(this.sourceField), sources);
        this.updateConstraintPorts(d3.select(this.destinationField), destinations);
    }
        
    updateConstraintPorts(parentElement, ports) {
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
    
    updateConstraints(constraints) {
        // Display constraints
        this.constraints.selectAll('*').remove();
        
        const thisRef = this;
        
        this.constraints
            .selectAll('li')
            .data(constraints)
            .enter()
            .append('li')
                .html(constraint => `<span>${constraint.name}: ${constraint.source} &rarr; ${constraint.destination} ${constraint.relation} ${constraint.time}</span> ${Utility.AddDeleteButton(constraint.name)}`)
            .on('click', function(data) {
                thisRef.constraints.node().querySelectorAll('li')
                    .forEach((constraint) => {
                        if (constraint !== this) { constraint.classList.remove('constraintSelected'); }
                    });
                this.classList.toggle('constraintSelected');
                thisRef.populateParameterForm.bind(thisRef)(data);
            });

        for (const constraint of constraints) {
            this.setupDeleteButtonListener(`${constraint.name}`);
        }
    }
    
    populateParameterForm(constraint) {
        this.name = constraint.name;
        this.source = constraint.source;
        this.destination = constraint.destination;
        this.relation = constraint.relation;
        this.time = constraint.time;
    }
    
    toString() {
        return "ViewConstraint";
    }
}

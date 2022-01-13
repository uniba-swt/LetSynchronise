'use strict';

class ViewConstraint {
    root = null;
    
    nameField = null;
    eventChainField = null;
    relationField = null;
    timeField = null;
    
    submitButton = null;
    
    constraints = null;
    
    deleteHandler = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        // Define or edit constraint
        this.nameField = this.root.querySelector('#view-analyse-constraint-name');
        this.eventChainField = this.root.querySelector('#view-analyse-constraint-event-chain');
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
    
    get eventChain() {
        return this.eventChainField.value;
    }
    
    set eventChain(eventChain) {
        this.eventChainField.value = eventChain;
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
            'eventChain': this.eventChain,
            'relation': this.relation,
            'time': this.time
        };
    }
    
    get constraintClean() {
        return {
            'name': this.name.trim(),
            'eventChain': this.eventChain.trim(),
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
        
        const allConstraintNames = new Set();
        const allConstraints = d3.select(this.eventChainField).selectAll('option')
                                   .each(function(d,i) { allConstraintNames.add(d3.select(this).attr('value')); })
        if (allConstraintNames.has(constraint.name)) {
            alert('Name cannot be the same as an event chain.');
            return false;
        }

        if (constraint.eventChain == 'null ') {
            alert('Choose event chain of constraint.');
            return false;
        }
        
        if (constraint.relation == 'null ') {
            alert('Choose relation of constraint.');
            return false;
        }
        
        if (constraint.time == null || isNaN(constraint.time)) {
            alert('Time has to be a decimal number.');
            return false;
        }
        const time = parseFloat(constraint.time);
        if (time < 0) {
            alert('Time cannot be negative');
            return false;
        }
        
        return true;
    }
    
    updateConstraintSelectors(eventChains) {
        const eventChainNames = eventChains.map(eventChain => eventChain.name);
        
        // Create list of available sources and destinations
        this.updateConstraintEventChains(d3.select(this.eventChainField), eventChainNames);
    }
        
    updateConstraintEventChains(parentElement, eventChainNames) {
        // Create list of available ports
        parentElement.selectAll('*').remove();
        parentElement
            .append('option')
                .property('disabled', true)
                .property('selected', true)
                .property('hidden', true)
                .attr('value', 'null ')
                .text('Choose ...');

        eventChainNames.forEach(name =>
            parentElement
                .append('option')
                    .attr('value', name)
                    .text(name)
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
                .html(constraint => `<span>${constraint.name}: ${constraint.eventChain} ${constraint.relation} ${constraint.time}</span> ${Utility.AddDeleteButton(constraint.name)}`)
            .on('click', function(event, data) {
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
        this.eventChain = constraint.eventChain;
        this.relation = constraint.relation;
        this.time = constraint.time;
    }
    
    toString() {
        return "ViewConstraint";
    }
}

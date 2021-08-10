'use strict';

class ViewEventChain {
    root = null;
    
    nameField = null;
    dependencyField = null;
    
    nextButton = null;
    submitButton = null;
    
    dependencies = null;
    eventChains = null;
    
    deleteHandler = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        // Define or edit constraint
        this.nameField = this.root.querySelector('#view-analyse-event-chain-name');
        this.dependencyField = this.root.querySelector('#view-analyse-event-chain-dependency');

        this.nextButton = this.root.querySelector('#nextDependency');
        this.submitButton = this.root.querySelector('#submitEventChain');
        
        this.dependencies = d3.select('#view-analyse-event-chain-dependencies');
        this.eventChains = d3.select('#view-analyse-event-chains');
    }
    
    
    get name() {
        return this.nameField.value;
    }
    
    set name(name) {
        this.nameField.value = name;
    }
    
    get dependency() {
        return this.dependencyField.value;
    }
    
    set dependency(dependency) {
        this.dependencyField.value = dependency;
    }
    
    get eventChainRaw() {
        return {
            'name': this.name,
            'dependencies': this.dependencies
        };
    }
    
    get constraintClean() {
        return {
            'name': this.name.trim(),
            'dependencies': this.dependencies
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
            if (this.validateEventChain(this.eventChainRaw)) {
                // Call the handler.
                handler(this.eventChainClean);
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
    }
    
    
    validateEventChain(eventChain) {
        if (eventChain.name == null || eventChain.name.trim() == '') {
            alert('Name cannot be blank.');
            return false;
        }

        if (eventChain.dependency == 'null ') {
            alert('Choose a dependency.');
            return false;
        }
                
        return true;
    }
    
    updateEventChainSelectors(dependencies) {
        const dependencyNames = dependencies.map(dependency => dependency.name);
        
        // Create list of available dependencies
        this.updateDependencies(d3.select(this.dependencyField), dependencyNames);
    }
        
    updateDependencies(parentElement, dependencyNames) {
        // Create list of available dependencies
        parentElement.selectAll('*').remove();
        parentElement
            .append('option')
                .property('disabled', true)
                .property('selected', true)
                .property('hidden', true)
                .attr('value', 'null ')
                .text('Choose ...');

        dependencyNames.forEach(name =>
            parentElement
                .append('option')
                    .attr('value', name)
                    .text(name)
        );
    }
    
    updateEventChains(rawEventChains) {
        // Display event chains
        const eventChains = Utility.FormatChains(rawEventChains);
        this.eventChains.selectAll('*').remove();
        
        const thisRef = this;
        
        this.eventChains
            .selectAll('li')
            .data(eventChains)
            .enter()
            .append('li')
                .html(eventChain => {
                    const dependencies = eventChain.segments.join(' &rarr; ');
                    return `<span>${eventChain.name}: ${dependencies}</span> ${Utility.AddDeleteButton(eventChain.name)}`;
                })
            .on('click', function(data) {
                thisRef.eventChains.node().querySelectorAll('li')
                    .forEach(eventChain => {
                        if (eventChain !== this) { eventChain.classList.remove('eventChainSelected'); }
                    });
                this.classList.toggle('eventChainSelected');
            });

        for (const eventChain of eventChains) {
            this.setupDeleteButtonListener(`${eventChain.name}`);
        }
    }
    
    toString() {
        return "ViewEventChain";
    }
}

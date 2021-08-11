'use strict';

class ViewEventChain {
    root = null;
    
    nameField = null;
    dependencyField = null;
    dependenciesField = null;
    
    nextButton = null;
    clearButton = null;
    submitButton = null;
    
    eventChains = null;
    
    deleteHandler = null;
    
    static get ArrowSeparator() {return '--&gt;' };
    
    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        // Define or edit an event chain
        this.nameField = this.root.querySelector('#view-analyse-event-chain-name');
        this.dependencyField = this.root.querySelector('#view-analyse-event-chain-dependency');
        this.dependenciesField = this.root.querySelector('#view-analyse-event-chain-dependencies');

        this.nextButton = this.root.querySelector('#nextDependency');
        this.clearButton = this.root.querySelector('#clearDependencies');
        this.submitButton = this.root.querySelector('#submitEventChain');
        
        // Current event chains
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
    
    get dependencies() {
    	if (this.dependenciesField.innerHTML) {
	    	return this.dependenciesField.innerHTML.split(ViewEventChain.ArrowSeparator)
	    		.map(name => name.trim());
    	}
    	
    	return [];
    }
    
    set dependencies(dependencies) {
    	this.dependenciesField.innerHTML = dependencies.join(` ${ViewEventChain.ArrowSeparator} `);
    }
    
    get eventChainRaw() {
        return {
            'name': this.name,
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

    registerNextHander(handler) {
    	this.nextButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the dependency.
            if (this.validateDependency(this.dependency)) {
                // Call the handler.
                handler(this.dependency);
            }
    	});
    }
    
    registerClearHander(handler) {
    	this.clearButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the dependency.
            this.dependencies = [];
            handler();
    	});
    }

    registerSubmitHandler(handler) {
        this.submitButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the dependency.
            if (this.validateEventChain(this.eventChainRaw)) {
                // Call the handler.
                handler(this.eventChainRaw);
                this.dependencies = [];
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
    }
    
    validateDependency(dependency) {
        if (dependency == 'null ') {
            alert('Choose a dependency.');
            return false;
        }
                
        return true;
    }
    
    validateEventChain(eventChain) {
        if (eventChain.name == null || eventChain.name.trim() == '') {
            alert('Name cannot be blank.');
            return false;
        }
        
        if (eventChain.name.split('-').length > 1 || eventChain.name.split('_').length > 1) {
            alert('Name cannot contain a dash \'-\' or underscore \'_\'.');
            return false;
        }

        if (eventChain.dependencies == null || !eventChain.dependencies.length) {
            alert('Dependencies cannot be empty.');
            return false;
        }
                
        return true;
    }
    
    updateNextDependency(dependencyName, nextDependencies) {
    	this.dependencies = this.dependencies.concat(dependencyName);
    	this.updateEventChainSelectors(nextDependencies);
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
        const eventChains = Utility.SimplifyChains(rawEventChains);
        this.eventChains.selectAll('*').remove();
        
        const thisRef = this;
        
        this.eventChains
            .selectAll('li')
            .data(eventChains)
            .enter()
            .append('li')
                .html(eventChain => {
                    const dependencies = eventChain.segments.join(` ${ViewEventChain.ArrowSeparator} `);
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

'use strict';

class ViewMemory {
    root = null;
    
    nameField = null;
    sizeField = null;
    latencyField = null
    
    memories = null;
    
    submitButton = null;
        
    deleteHandler = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-platform');
        
        // Define or edit a memory
        this.nameField = this.root.querySelector('#view-platform-memory-name');
        this.sizeField = this.root.querySelector('#view-platform-memory-size');
        this.latencyField = this.root.querySelector('#view-platform-memory-latency');
        
        this.submitButton = this.root.querySelector('#submitMemory');
        
        this.memories = d3.select('#view-platform-memories');
    }
    
    
    get ElementIdPrefix() {
        return 'memory';
    }
    
    get name() {
        return this.nameField.value;
    }
    
    set name(name) {
        this.nameField.value = name;
    }
    
    get size() {
        return this.sizeField.value;
    }
    
    set size(size) {
        this.sizeField.value = size;
    }
    
    get latency() {
        return this.latencyField.value;
    }
    
    set latency(latency) {
        this.latencyField.value = latency;
    }
    
    get memoryRaw() {
        return {
            'name': this.name,
            'size': this.size,
            'latency': this.latency
        };
    }
    
    get memoryClean() {
        return {
            'name': this.name.trim(),
            'size': Math.abs(parseInt(this.size)),
            'latency': Math.abs(parseFloat(this.latency)) * Utility.MsToNs,
        };
    }
    
    
    // -----------------------------------------------------
    // Setup listeners
    
    setupDeleteButtonListener(elementId) {
        const deleteButton = this.root.querySelector(`#${this.ElementIdPrefix}-${elementId}`);
        
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
            
            // Validate the memory.
            if (this.validateMemory(this.memoryRaw)) {
                // Call the handler.
                handler(this.memoryClean);
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
    }
    
    
    validateMemory(memory) {
        if (memory.name == null || memory.name.trim() == '') {
            alert('Memory name cannot be blank.');
            return false;
        }
        if (!Utility.ValidName(memory.name.trim())) {
            alert('Memory name can only start with an alphabetical or underscore character, and continue with alphanumerical or underscore characters.');
            return false;
        }
        
        if (!Utility.ValidPositiveInteger(memory.size)) {
            alert('Size has to be a positive integer number.');
            return false;
        }
        
        if (!Utility.ValidPositiveDecimal(memory.latency)) {
            alert('Latency has to be a positive decimal number.');
            return false;
        }
        const latencyNs = parseFloat(memory.latency) * Utility.MsToNs;
        if (!Number.isSafeInteger(latencyNs)) {
            alert('Latency is unable to be represented with nanosecond precision.');
            return false;
        }
        
        return true;
    }
    
    updateMemorySelectors(tasks) {
        // TODO: Implement
    }
            
    updateMemories(memories) {
        // Display memories
        this.memories.selectAll('*').remove();
        
        const thisRef = this;
        
        this.memories
            .selectAll('li')
            .data(memories)
            .enter()
            .append('li')
                .html(memory => `<span><b>${memory.name}:</b> ${memory.size} bytes with ${memory.latency / Utility.MsToNs} ms latency</span> ${Utility.AddDeleteButton(this.ElementIdPrefix, memory.name)}`)
            .on('click', function(event, data) {
                thisRef.memories.node().querySelectorAll('li')
                    .forEach((memory) => {
                        if (memory !== this) { memory.classList.remove('memorySelected'); }
                    });
                this.classList.toggle('memorySelected');
                thisRef.populateParameterForm.bind(thisRef)(data);
            });

        for (const memory of memories) {
            this.setupDeleteButtonListener(`${memory.name}`);
        }
    }
    
    populateParameterForm(memory) {
        this.name = memory.name;
        this.size = memory.size;
        this.latency = memory.latency / Utility.MsToNs;
    }
    
    toString() {
        return "ViewMemory";
    }
}

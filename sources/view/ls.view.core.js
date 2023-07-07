'use strict';

class ViewCore {
    root = null;
    
    nameField = null;
    speedupField = null;
    
    cores = null;
    
    submitButton = null;
        
    deleteHandler = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-platform');
        
        // Define or edit a core
        this.nameField = this.root.querySelector('#view-platform-core-name');
        this.speedupField = this.root.querySelector('#view-platform-core-speedup');
        
        this.submitButton = this.root.querySelector('#submitCore');
        
        this.cores = d3.select('#view-platform-cores');
    }
    
    
    get name() {
        return this.nameField.value;
    }
    
    set name(name) {
        this.nameField.value = name;
    }
    
    get speedup() {
        return this.speedupField.value;
    }
    
    set speedup(speedup) {
        this.speedupField.value = speedup;
    }
    
    get coreRaw() {
        return {
            'name': this.name,
            'speedup': this.speedup
        };
    }
    
    get coreClean() {
        return {
            'name': this.name.trim(),
            'speedup': Math.abs(parseFloat(this.speedup))
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
            
            // Validate the core.
            if (this.validateCore(this.coreRaw)) {
                // Call the handler.
                handler(this.coreClean);
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
    }
    
    
    validateCore(core) {
        if (core.name == null || core.name.trim() == '') {
            alert('Core name cannot be blank.');
            return false;
        }
        if (core.name.trim().toLowerCase() == 'default') {
            alert(`Core name cannot be "${core.name.trim()}".`);
            return false;
        }
        if (!Utility.ValidName(core.name.trim())) {
            alert('Core name can only start with an alphabetical or underscore character, and continue with alphanumerical or underscore characters.');
            return false;
        }
        
        if (core.speedup == null || core.speedup.trim() == '' || isNaN(core.speedup)) {
            alert('Speedup has to be a decimal number.');
            return false;
        }
        const speedup = parseFloat(core.speedup);
        if (speedup < 0) {
            alert('Soeedup cannot be negative.');
            return false;
        }
        const speedupSplit = core.speedup.split('.');
        if (speedupSplit.length > 1 && speedupSplit[1].length > 2) {
            alert('Speedup cannot have more than 2 decimal places.');
            return false;
        }
        
        return true;
    }
    
    updateCoreSelectors(tasks) {
        // TODO: Implement
    }
            
    updateCores(cores) {
        // Display cores
        this.cores.selectAll('*').remove();
        
        const thisRef = this;
        
        this.cores
            .selectAll('li')
            .data(cores)
            .enter()
            .append('li')
                .html(core => `<span><b>${core.name}:</b> ${core.speedup}&times; speedup</span> ${Utility.AddDeleteButton(core.name)}`)
            .on('click', function(event, data) {
                thisRef.cores.node().querySelectorAll('li')
                    .forEach((core) => {
                        if (core !== this) { core.classList.remove('coreSelected'); }
                    });
                this.classList.toggle('coreSelected');
                thisRef.populateParameterForm.bind(thisRef)(data);
            });

        for (const core of cores) {
            this.setupDeleteButtonListener(`${core.name}`);
        }
    }
    
    populateParameterForm(core) {
        this.name = core.name;
        this.speedup = core.speedup;
    }
    
    toString() {
        return "ViewCore";
    }
}

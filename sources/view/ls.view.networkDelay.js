'use strict';

class ViewNetworkDelay {
    root = null;
    
    sourceField = null;
    destField = null;
    delayField = null;

    networkDelays = null;
    
    submitButton = null;
        
    deleteHandler = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-platform');
        
        // Define or edit a core
        this.sourceField = this.root.querySelector('#view-platform-networkDelay-source');
        this.destField = this.root.querySelector('#view-platform-networkDelay-dest');
        this.delayField = this.root.querySelector('#view-platform-networkDelay-delay');
        
        this.submitButton = this.root.querySelector('#submitNetworkDelay');

        this.networkDelays = d3.select('#view-platform-networkDelays');
    }
    
    
    get ElementIdPrefix() {
        return 'networkDelay';
    }
    
    get source() {
        return this.sourceField.value;
    }
    
    set source(source) {
        this.sourceField.value = source;
    }
    
    get dest() {
        return this.destField.value;
    }
    
    set dest(dest) {
        this.destField.value = dest;
    }

    get delay() {
        return this.delayField.value;
    }

    set delay(delay) {
        this.delayField.value = delay;
    }
    
    get networkDelayRow() {
        return {
            'source': this.source,
            'dest': this.dest,
            'delay': this.delay
        };
    }
    
    get networkDelayClean() {
        return {
            'source': this.source,
            'dest': this.dest,
            'delay': Math.abs(parseFloat(this.delay))
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
            
            // Validate the core.
            if (this.validateNetworkDelay(this.networkDelayRow)) {
                // Call the handler.
                handler(this.networkDelayClean);
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
    }
    
    
    validateNetworkDelay(networkDelay) {
        if (networkDelay.source == networkDelay.dest) {
            alert('Source and destination cannot be the same');
            return false;
        }
        
        if (networkDelay.delay == null || networkDelay.delay.trim() == '' || isNaN(networkDelay.delay)) {
            alert('Network delay has to be a decimal number.');
            return false;
        }
        const speedup = parseFloat(networkDelay.delay);
        if (speedup < 0) {
            alert('Network delay cannot be negative.');
            return false;
        }
        const delaySplit = networkDelay.delay.split('.');
        if (delaySplit.length > 1 && delaySplit[1].length > 2) {
            alert('Network delay cannot have more than 2 decimal places.');
            return false;
        }
        
        return true;
    }

    updateNetworkDelays(networkDelays) {
         this.networkDelays.selectAll('*').remove();
        
         const thisRef = this;
         
         this.networkDelays
             .selectAll('li')
             .data(networkDelays)
             .enter()
             .append('li')
                 .html(networkDelay => `<span><b>${networkDelay.source} -> ${networkDelay.dest}: </b> ${networkDelay.delay}ms delay</span> ${Utility.AddDeleteButton(this.ElementIdPrefix, networkDelay.id)}`)
             .on('click', function(event, data) {
                 thisRef.networkDelays.node().querySelectorAll('li')
                     .forEach((networkDelay) => {
                         if (networkDelay !== this) { networkDelay.classList.remove('networkDelaySelected'); }
                     });
                 this.classList.toggle('networkDelaySelected');
                 thisRef.populateParameterForm.bind(thisRef)(data);
             });
        
        for (const networkDelay of networkDelays) {
            this.setupDeleteButtonListener(`${networkDelay.id}`);
        }
    }
    
    toString() {
        return "ViewNetworkDelay";
    }
}

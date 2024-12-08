'use strict';

class ViewNetworkDelay {
    root = null;
    
    sourceField = null;
    destField = null;
    bcdtField = null;
    acdtField = null;
    wcdtField = null;

    networkDelays = null;
    
    submitButton = null;
        
    deleteHandler = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-platform');
        
        // Define or edit a core
        this.sourceField = this.root.querySelector('#view-platform-networkDelay-source');
        this.destField = this.root.querySelector('#view-platform-networkDelay-dest');
        this.bcdtField = this.root.querySelector('#view-platform-networkDelay-bcdt');
        this.acdtField = this.root.querySelector('#view-platform-networkDelay-bcdt');
        this.wcdtField = this.root.querySelector('#view-platform-networkDelay-bcdt');
        
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

    get bcdt() {
        return this.bcdtField.value;
    }

    set bcdt(bcdt) {
        this.bcdtField.value = bcdt;
    }

    get acdt() {
        return this.acdtField.value;
    }

    set acdt(acdt) {
        this.acdtField.value = acdt;
    }

    get wcdt() {
        return this.wcdtField.value;
    }

    set wcdt(wcdt) {
        this.wcdtField.value = wcdt;
    }
    
    get networkDelayRow() {
        return {
            'source': this.source,
            'dest': this.dest,
            'bcdt': this.bcdt,
            'acdt': this.acdt,
            'wcdt': this.wcdt
        };
    }
    
    get networkDelayClean() {
        return {
            'source': this.source,
            'dest': this.dest,
            'bcdt': Math.abs(parseFloat(this.bcdt)),
            'acdt': Math.abs(parseFloat(this.acdt)),
            'wcdt': Math.abs(parseFloat(this.wcdt))
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

        //TODO: fix
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

    updateDeviceSelector(devices) {
        devices.sort();

        let source = d3.select(this.sourceField);
        let dest = d3.select(this.destField);

        this.deviceOptions(source, devices);
        this.deviceOptions(dest, devices);
    }

    deviceOptions(parentElement, devices) {
        parentElement.selectAll('*').remove();
        parentElement.append('option')
            .property('selected', true)
            .attr('value', 'Default')
            .text('');
        
        devices.forEach(device => 
            parentElement
                .append('option')
                .attr('value', device.name)
                .text(device.name)
        )
    }
    
    toString() {
        return "ViewNetworkDelay";
    }
}

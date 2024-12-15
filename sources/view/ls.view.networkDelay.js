'use strict';

class ViewNetworkDelay {
    root = null;
    
    sourceField = null;
    destField = null;
    bcdtField = null;
    acdtField = null;
    wcdtField = null;
    distributionField = null;

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
        this.distributionField = this.root.querySelector('#view-platform-networkDelay-distribution');
        
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

    get distribution() {
        return this.distributionField.value;
    }

    set distribution(distribution) {
        this.distributionField.value = distribution;
    }
    
    get networkDelayRow() {
        return {
            'source': this.source,
            'dest': this.dest,
            'bcdt': this.bcdt,
            'acdt': this.acdt,
            'wcdt': this.wcdt,
            'distribution': this.distribution
        };
    }
    
    get networkDelayClean() {
        return {
            'source': this.source,
            'dest': this.dest,
            'bcdt': Math.abs(parseFloat(this.bcdt)),
            'acdt': Math.abs(parseFloat(this.acdt)),
            'wcdt': Math.abs(parseFloat(this.wcdt)),
            'distribution': this.distribution
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
        
        if (isNaN(networkDelay.bcdt) || isNaN(networkDelay.acdt) || isNaN(networkDelay.wcdt)) {
            alert('Delay values should be a decimal number.');
            return false;
        }

        if (parseFloat(networkDelay.bcdt) < 0 || parseFloat(networkDelay.acdt) < 0 || parseFloat(networkDelay.wcdt) < 0) {
            alert('Network delay cannot be negative.');
            return false;
        }
        if ((networkDelay.bcdt.split('.').length > 1 && networkDelay.bcdt.split('.')[1].length > 2) ||
            (networkDelay.acdt.split('.').length > 1 && networkDelay.acdt.split('.')[1].length > 2) ||
            (networkDelay.wcdt.split('.').length > 1 && networkDelay.wcdt.split('.')[1].length > 2)) {
            alert('Network delay cannot have more than 2 decimal places.');
            return false;
        }
        
        return true;
    }

    updateNetworkDelays(networkDelays) {
         this.networkDelays.selectAll('*').remove();

        const table = this.networkDelays.append('table').attr('class', 'table-responsive table-bordered');

        if (networkDelays.length > 0) {
            table.append('thead')
                .append('tr')
                .selectAll('th')
                .data(['Source', 'Destination', 'BCDT (ms)', 'ACDT (ms)', 'WCDT (ms)', 'Distribution', 'Delete'])
                .enter()
                .append('th')
                .text(header => header)
                .attr('class', 'p-2');

            const tbody = table.append('tbody');

            networkDelays.forEach(delay => {
                    const row = tbody.append('tr');
                    row.append('td').text(delay.source).attr('class', 'p-2');
                    row.append('td').text(delay.dest).attr('class', 'p-2');
                    row.append('td').text(delay.bcdt).attr('class', 'p-2');
                    row.append('td').text(delay.acdt).attr('class', 'p-2');
                    row.append('td').text(delay.wcdt).attr('class', 'p-2');
                    row.append('td').text(delay.distribution).attr('class', 'p-2');
                    row.append('td').html(Utility.AddDeleteButton(this.ElementIdPrefix, delay.id)).attr('class', 'p-2');
                    this.setupDeleteButtonListener(`${delay.id}`);
                });
        };
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

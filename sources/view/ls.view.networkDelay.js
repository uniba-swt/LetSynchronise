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
        this.acdtField = this.root.querySelector('#view-platform-networkDelay-acdt');
        this.wcdtField = this.root.querySelector('#view-platform-networkDelay-wcdt');
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
    
    get networkDelayRaw() {
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
            'name': this.source + "-to-" + this.dest,
            'source': this.source.trim(),
            'dest': this.dest.trim(),
            'bcdt': Math.abs(parseFloat(this.bcdt)) * Utility.MsToNs,
            'acdt': Math.abs(parseFloat(this.acdt)) * Utility.MsToNs,
            'wcdt': Math.abs(parseFloat(this.wcdt)) * Utility.MsToNs,
            'distribution': this.distribution.trim()
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
            if (this.validateNetworkDelay(this.networkDelayRaw)) {
                // Call the handler.
                handler(this.networkDelayClean);
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
    }
    
    
    validateNetworkDelay(parameters) {
        if (parameters.source == parameters.dest) {
            alert('Source and destination cannot be the same');
            return false;
        }
        
        if (isNaN(parameters.bcdt) || isNaN(parameters.acdt) || isNaN(parameters.wcdt)) {
            alert('Delay values should be a decimal number.');
            return false;
        }

        if (parseFloat(parameters.bcdt) < 0 || parseFloat(parameters.acdt) < 0 || parseFloat(parameters.wcdt) < 0) {
            alert('Network delay cannot be negative.');
            return false;
        }
        if ((parameters.bcdt.split('.').length > 1 && parameters.bcdt.split('.')[1].length > 2) ||
            (parameters.acdt.split('.').length > 1 && parameters.acdt.split('.')[1].length > 2) ||
            (parameters.wcdt.split('.').length > 1 && parameters.wcdt.split('.')[1].length > 2)) {
            alert('Network delay cannot have more than 2 decimal places.');
            return false;
        }

        if (parseFloat(parameters.bcdt) <= 0) {
            alert('BCDT has to be greater than 0.');
            return false;
        }
        if (parseFloat(parameters.acdt) <= 0) {
            alert('ACDT has to be greater than 0.');
            return false;
        }
        if (parseFloat(parameters.wcdt) <= 0) {
            alert('WCDT has to be greater than 0.');
            return false;
        }

        const bcdt = parameters.bcdt * Utility.MsToNs;
        const acdt = parameters.acdt * Utility.MsToNs;
        const wcdt = parameters.wcdt * Utility.MsToNs;

        if (!Number.isSafeInteger(bcdt)) {
            alert('BCDT is unable to be represented with nanosecond precision.');
            return false;
        }
        if (!Number.isSafeInteger(acdt)) {
            alert('ACDT is unable to be represented with nanosecond precision.');
            return false;
        }
        if (!Number.isSafeInteger(wcdt)) {
            alert('WCDT is unable to be represented with nanosecond precision.');
            return false;
        }

        if (wcdt < bcdt) {
            alert('WCDT cannot be less than BCET.');
            return false;
        }
        if (wcdt < acdt || acdt < bcdt) {
            alert('ACDT cannot be less than BCDT or greater than WCDT.');
            return false;
        }
        
        return true;
    }

    updateNetworkDelays(networkDelays) {
        this.networkDelays.selectAll('*').remove();
        const thisRef = this;

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
                row.append('td').text(Number(delay.bcdt) / Utility.MsToNs).attr('class', 'p-2');
                row.append('td').text(Number(delay.acdt) / Utility.MsToNs).attr('class', 'p-2');
                row.append('td').text(Number(delay.wcdt) / Utility.MsToNs).attr('class', 'p-2');
                row.append('td').text(delay.distribution).attr('class', 'p-2');
                row.append('td').html(Utility.AddDeleteButton(this.ElementIdPrefix, delay.name)).attr('class', 'p-2');
                this.setupDeleteButtonListener(`${delay.name}`);

                row.on('click', function (event) {
                    const clickedRow = event.currentTarget;
                    const isSelected = clickedRow.classList.contains('networkDelaySelected');

                    thisRef.networkDelays.node().querySelectorAll('tr')
                        .forEach(rowElement => rowElement.classList.remove('networkDelaySelected'));

                    if (!isSelected) {
                        clickedRow.classList.add('networkDelaySelected');
                        thisRef.populateDelayParameterForm(delay);
                    }
                });
            });
        };
    }

    populateDelayParameterForm(parameters) {
        this.source = parameters.source;
        this.dest = parameters.dest;
        this.bcdt = Number(parameters.bcdt) / Utility.MsToNs;
        this.acdt = Number(parameters.acdt) / Utility.MsToNs;
        this.wcdt = Number(parameters.wcdt) / Utility.MsToNs;
        this.distribution = parameters.distribution;
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

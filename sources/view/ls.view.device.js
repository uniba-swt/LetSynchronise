'use strict';

class ViewDevice {
    root = null;
    
    nameField = null;
    speedupField = null;

    delayDeviceField = null;
    protocolNameField = null;
    bcdtField = null;
    acdtField = null;
    wcdtField = null;
    distributionField = null;
    
    devices = null;
    delays = null;
    
    submitDeviceButton = null;
    submitDeviceDelayButtoon = null;
        
    deleteHandler = null;
    deleteDelayHandler = null;
    

    constructor() {
        this.root = document.querySelector('#nav-platform');
        
        // Define or edit a device
        this.nameField = this.root.querySelector('#view-platform-device-name');
        this.speedupField = this.root.querySelector('#view-platform-device-speedup');

        this.delayDeviceField = this.root.querySelector("#view-platform-delay-device");
        this.protocolNameField = this.root.querySelector("#view-platform-delay-protocol-name");
        this.bcdtField = this.root.querySelector("#view-platform-device-protocol-bcdt");
        this.acdtField = this.root.querySelector("#view-platform-device-protocol-acdt");
        this.wcdtField = this.root.querySelector("#view-platform-device-protocol-wcdt");
        this.distributionField = this.root.querySelector("#view-platform-device-protocol-distribution")
        
        this.submitDeviceButton = this.root.querySelector('#submitDevice');
        this.submitDeviceDelayButtoon = this.root.querySelector("#submitDeviceProtocolDelay")
        
        this.devices = d3.select('#view-platform-devices');
        this.delays = d3.select('#view-platform-device-delays');
    }
    
    
    get ElementIdPrefix() {
        return 'device';
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

    get delayDevice() {
        return this.delayDeviceField.value;
    }

    set delayDevice(delayDevice) {
        this.delayDeviceField.value = delayDevice;
    }

    get protocolName() {
        return this.protocolNameField.value;
    }

    set protocolName(protocolName) {
        this.protocolNameField.value = protocolName;
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
    
    get deviceRaw() {
        return {
            'name': this.name,
            'speedup': this.speedup
        };
    }
    
    get deviceClean() {
        return {
            'name': this.name.trim(),
            'speedup': Math.abs(parseFloat(this.speedup))
        };
    }

    get deviceDelayRaw() {
        return {
            'name': this.delayDevice,
            'protocol': this.protocolName,
            'bcdt': this.bcdt,
            'acdt': this.acdt,
            'wcdt': this.wcdt,
            'distribution': this.distribution
        };
    }

    get deviceDelayClean() {
        return {
            'name': this.delayDevice.trim(),
            'protocol': this.protocolName.trim(),
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

    setupDeleteDelayButtonListener(protocol, device) {
        const deleteButton = this.root.querySelector(`#${protocol}-${device}`);
        
        deleteButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Call the handler.
            this.deleteDelayHandler(protocol, device);
        });
    }
    
    
    // -----------------------------------------------------
    // Registration of handlers from the controller

    registerSubmitHandler(handler) {
        this.submitDeviceButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the device.
            if (this.validateDevice(this.deviceRaw)) {
                // Call the handler.
                handler(this.deviceClean);
            }
        });

        
    }

    registerDelaySubmitHandler(handler) {
        this.submitDeviceDelayButtoon.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            if (this.validateDeviceDelay(this.deviceDelayRaw)) {
                handler(this.deviceDelayClean);
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
    }

    registerDeleteDelayHandler(handler) {
        this.deleteDelayHandler = handler;
    }
    
    
    validateDevice(device) {
        if (device.name == null || device.name.trim() == '') {
            alert('Device name cannot be blank.');
            return false;
        }
        if (device.name.trim().toLowerCase() == 'default') {
            alert(`Device name cannot be "${device.name.trim()}".`);
            return false;
        }
        if (!Utility.ValidName(device.name.trim())) {
            alert('Device name can only start with an alphabetical or underscore character, and continue with alphanumerical or underscore characters.');
            return false;
        }
        
        if (device.speedup == null || device.speedup.trim() == '' || isNaN(device.speedup)) {
            alert('Speedup has to be a decimal number.');
            return false;
        }
        const speedup = parseFloat(device.speedup);
        if (speedup < 0) {
            alert('Speedup cannot be negative.');
            return false;
        }
        const speedupSplit = device.speedup.split('.');
        if (speedupSplit.length > 1 && speedupSplit[1].length > 2) {
            alert('Speedup cannot have more than 2 decimal places.');
            return false;
        }
        
        return true;
    }

    validateDeviceDelay(parameters) {
        if (!parameters.protocol || parameters.protocol.trim() == '') {
            alert('Protocol name cannot be blank.');
            return false;
        }
        if (parameters.protocol.trim().toLowerCase() == 'default') {
            alert(`Protocol name cannot be "${parameters.protocol.trim()}".`);
            return false;
        }
        if (!/^[A-Za-z]+$/.test(parameters.protocol)) {
            alert('Protocol name should only include alphabet letters.');
            return false;
        }

        if (isNaN(parameters.bcdt) || isNaN(parameters.acdt) || isNaN(parameters.wcdt)) {
            alert('Delay values should be a decimal number.');
            return false;
        }
        if (!parameters.bcdt || parameters.bcdt.trim() == '' 
            || !parameters.acdt || parameters.acdt.trim() == '' || !parameters.wcdt || parameters.wcdt.trim() == '') {
            alert('Delay values cannot be empty. Put 1 if unsure.');
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
            
    updateDevices(devices) {
        // Display devices
        this.devices.selectAll('*').remove();
        
        const thisRef = this;
        
        this.devices
            .selectAll('li')
            .data(devices)
            .enter()
            .append('li')
                .html(device => `<span><b>${device.name}:</b> ${device.speedup}&times; speedup</span> ${Utility.AddDeleteButton(this.ElementIdPrefix, device.name)}`)
            .on('click', function(event, data) {
                thisRef.devices.node().querySelectorAll('li')
                    .forEach((device) => {
                        if (device !== this) { device.classList.remove('deviceSelected'); }
                    });
                this.classList.toggle('deviceSelected');
                thisRef.populateParameterForm.bind(thisRef)(data);
            });

        for (const device of devices) {
            this.setupDeleteButtonListener(`${device.name}`);
        }

        const dropdown = d3.select(this.delayDeviceField);
        dropdown.selectAll('*').remove();
        dropdown.append('option')
            .property('disabled', true)
            .property('selected', true)
            .property('hidden', true)
            .attr('value', 'null ')
            .text('Choose ...');
        
        devices.sort();
        devices.forEach(device => 
            dropdown.append('option').attr('value', `${device.name}`).text(device.name)
        )

        this.updateDevicesDelay(devices);
    }

    updateDevicesDelay(devices) {
        this.delays.selectAll('*').remove();
        const thisRef = this;

        // To ensure that the devices with delays assigned get displayed
        const filteredData = devices.filter(device => device.delays && device.delays.length > 0);

        const table = this.delays.append('table').attr('class', 'table-responsive table-bordered');

        if (filteredData.length > 0) {
            table.append('thead')
                .append('tr')
                .selectAll('th')
                .data(['Device Name', 'Protocol Name', 'BCDT (ms)', 'ACDT (ms)', 'WCDT (ms)', 'Distribution', 'Delete'])
                .enter()
                .append('th')
                .text(header => header)
                .attr('class', 'p-2');

            const tbody = table.append('tbody');

            filteredData.forEach(device => {
                device.delays.forEach(delay => {
                    const row = tbody.append('tr');
                    row.append('td').text(device.name).attr('class', 'p-2');
                    row.append('td').text(delay.protocol).attr('class', 'p-2');
                    row.append('td').text(Number(delay.bcdt) / Utility.MsToNs).attr('class', 'p-2');
                    row.append('td').text(Number(delay.acdt) / Utility.MsToNs).attr('class', 'p-2');
                    row.append('td').text(Number(delay.wcdt) / Utility.MsToNs).attr('class', 'p-2');
                    row.append('td').text(delay.distribution).attr('class', 'p-2');
                    row.append('td').html(Utility.AddDeleteButton(delay.protocol, device.name)).attr('class', 'p-2');
                    this.setupDeleteDelayButtonListener(delay.protocol, device.name);

                    row.on('click', function (event) {
                        const clickedRow = event.currentTarget;
                        const isSelected = clickedRow.classList.contains('deviceDelaySelected');
    
                        thisRef.delays.node().querySelectorAll('tr')
                            .forEach(rowElement => rowElement.classList.remove('deviceDelaySelected'));
    
                        if (!isSelected) {
                            clickedRow.classList.add('deviceDelaySelected');
                            thisRef.populateDelayParameterForm(device.name, delay);
                        }
                    });
                });
            });
        } 
    }
    
    populateParameterForm(device) {
        this.name = device.name;
        this.speedup = device.speedup;
    }

    populateDelayParameterForm(deviceName, delayParameters) {
        this.delayDevice = deviceName;
        this.protocolName = delayParameters.protocol;
        this.bcdt = Number(delayParameters.bcdt) / Utility.MsToNs;
        this.acdt = Number(delayParameters.acdt) / Utility.MsToNs;
        this.wcdt = Number(delayParameters.wcdt) / Utility.MsToNs;
        this.distribution = delayParameters.distribution;
    }
    
    toString() {
        return "ViewDevice";
    }
}

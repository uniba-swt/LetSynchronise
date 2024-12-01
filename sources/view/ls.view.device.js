'use strict';

class ViewDevice {
    root = null;
    
    nameField = null;
    speedupField = null;

    delayDeviceField = null;
    protocolNameField = null;
    protocolDelayField = null;
    bcdtField = null;
    acdtField = null;
    wcdtField = null;
    
    devices = null;
    delays = null;
    
    submitDeviceButton = null;
    submitDeviceDelayButtoon = null;
        
    deleteHandler = null;
    

    constructor() {
        this.root = document.querySelector('#nav-platform');
        
        // Define or edit a device
        this.nameField = this.root.querySelector('#view-platform-device-name');
        this.speedupField = this.root.querySelector('#view-platform-device-speedup');

        this.delayDeviceField = this.root.querySelector("#view-platform-delay-device");
        this.protocolNameField = this.root.querySelector("#view-platform-delay-protocol-name");
        this.protocolDelayField = this.root.querySelector("#view-platform-device-protocol-delay");
        this.bcdtField = this.root.querySelector("#view-platform-device-protocol-bcdt");
        this.acdtField = this.root.querySelector("#view-platform-device-protocol-acdt");
        this.wcdtField = this.root.querySelector("#view-platform-device-protocol-wcdt");
        
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

    get protocolDelay() {
        return this.protocolDelayField.value;
    }

    set protocolDelay(protocolDelay) {
        this.protocolDelayField.value = protocolDelay;
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
            'delay': this.protocolDelay,
            'bcdt': this.bcdt,
            'acdt': this.acdt,
            'wcdt': this.wcdt
        };
    }

    get deviceDelayClean() {
        return {
            'name': this.delayDevice.trim(),
            'protocol': this.protocolName.trim(),
            'delay': Math.abs(parseFloat(this.protocolDelay)),
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
            
            if (this.validateDelayDevice(this.deviceDelayRaw)) {
                handler(this.deviceDelayClean);
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
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

    validateDelayDevice(delayDevice) {
        if (!delayDevice.protocol || delayDevice.protocol.trim() == '') {
            alert('Protocol name cannot be blank.');
            return false;
        }
        if (delayDevice.protocol.trim().toLowerCase() == 'default') {
            alert(`Protocol name cannot be "${delayDevice.protocol.trim()}".`);
            return false;
        }
        if (!/^[A-Za-z]+$/.test(delayDevice.protocol)) {
            alert('Protocol name should only include alphabet letters.');
            return false;
        }

        if (isNaN(delayDevice.delay) || isNaN(delayDevice.bcdt) || isNaN(delayDevice.acdt) || isNaN(delayDevice.wcdt)) {
            alert('Delay values should be a decimal number.');
            return false;
        }
        if (!delayDevice.delay || delayDevice.delay.trim() == '' || !delayDevice.bcdt || delayDevice.bcdt.trim() == '' 
            || !delayDevice.acdt || delayDevice.acdt.trim() == '' || !delayDevice.wcdt || delayDevice.wcdt.trim() == '') {
            alert('Delay values cannot be empty. Put 1 if unsure.');
            return false;
        }
        
        return true;
    }
    
    updateDeviceSelectors(tasks) {
        // TODO: Implement
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

        const dropdown = this.delayDeviceField;
        dropdown.innerHTML = "";

        devices.forEach(device => {
            const option = document.createElement("option");
            option.value = device.name;
            option.textContent = device.name;
            dropdown.appendChild(option);
        })
    }

    updateDevicesDelay(devices) {
        this.delays.selectAll('*').remove();

        const thisRef = this;

        const filteredData = devices.filter(device => device.delays && device.delays.length > 0);

        const table = this.delays.append('table').attr('class', 'table-responsive table-bordered');

        table.append('thead')
        .append('tr')
        .selectAll('th')
        .data(['Device Name', 'Protocol Name', 'Delay (ms)', 'BCDT (ms)', 'ACDT (ms)', 'WCDT (ms)'])
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
                row.append('td').text(delay.delay).attr('class', 'p-2');
                row.append('td').text(delay.bcdt).attr('class', 'p-2');
                row.append('td').text(delay.acdt).attr('class', 'p-2');
                row.append('td').text(delay.wcdt).attr('class', 'p-2');
            });
    });
    }
    
    populateParameterForm(device) {
        this.name = device.name;
        this.speedup = device.speedup;
    }
    
    toString() {
        return "ViewDevice";
    }
}

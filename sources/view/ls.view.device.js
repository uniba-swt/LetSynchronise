'use strict';

class ViewDevice {
    root = null;
    
    nameField = null;
    speedupField = null;
    
    devices = null;
    
    submitButton = null;
        
    deleteHandler = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-platform');
        
        // Define or edit a device
        this.nameField = this.root.querySelector('#view-platform-device-name');
        this.speedupField = this.root.querySelector('#view-platform-device-speedup');
        
        this.submitButton = this.root.querySelector('#submitDevice');
        
        this.devices = d3.select('#view-platform-devices');
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
            console.log("clicked")
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the device.
            if (this.validateDevice(this.deviceRaw)) {
                // Call the handler.
                handler(this.deviceClean);
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
            alert('Soeedup cannot be negative.');
            return false;
        }
        const speedupSplit = device.speedup.split('.');
        if (speedupSplit.length > 1 && speedupSplit[1].length > 2) {
            alert('Speedup cannot have more than 2 decimal places.');
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
    }
    
    populateParameterForm(device) {
        this.name = device.name;
        this.speedup = device.speedup;
    }
    
    toString() {
        return "ViewDevice";
    }
}

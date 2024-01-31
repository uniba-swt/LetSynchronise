'use strict';

class ViewInterface {
    root = null;

    inputField = null;
    outputField = null;
    
    submitInputButton = null;
    submitOutputButton = null;
    
    systemInputs = null;
    systemOutputs = null;
    
    deleteInputHandler = null;
    deleteOutputHandler = null;


    constructor() {
        this.root = document.querySelector('#view-system-interface');

        // Define or edit system inputs and outputs
        this.inputField = this.root.querySelector('#view-system-input-name');
        this.outputField = this.root.querySelector('#view-system-output-name');
        
        this.submitInputButton = this.root.querySelector('#submitInput');
        this.submitOutputButton = this.root.querySelector('#submitOutput');
        
        this.systemInputs = d3.select('#view-system-inputs');
        this.systemOutputs = d3.select('#view-system-outputs');
    }
    
    get ElementIdPrefix() {
        return 'interface';
    }
    
    get input() {
        return this.inputField.value;
    }
    
    set input(input) {
        this.inputField.value = input;
    }
    
    get output() {
        return this.outputField.value;
    }
    
    set output(output) {
        this.outputField.value = output;
    }
    
    get inputClean() {
        return {
            'name': this.input.trim()
        };
    }

    get outputClean() {
        return {
            'name': this.output.trim()
        };
    }
    
    
    // -----------------------------------------------------
    // Setup listeners
    
    setupDeleteInputButtonListener(elementId) {
        const deleteInputButton = this.root.querySelector(`#${this.ElementIdPrefix}-${elementId}`);
        
        deleteInputButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Call the handler.
            this.deleteInputHandler(elementId);
        });
    }
    
    setupDeleteOutputButtonListener(elementId) {
        const deleteOutputButton = this.root.querySelector(`#${this.ElementIdPrefix}-${elementId}`);
        
        deleteOutputButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Call the handler.
            this.deleteOutputHandler(elementId);
        });
    }
    
    
    // -----------------------------------------------------
    // Registration of handlers from the controller
    
    registerSubmitInputHandler(handler) {
        this.submitInputButton.addEventListener('click', event => {
            event.preventDefault();

            if (this.validateName(this.input)) {
                handler(this.inputClean);
                this.input = '';
            }
        });
    }

    registerSubmitOutputHandler(handler) {
        this.submitOutputButton.addEventListener('click', event => {
            event.preventDefault();
            
            if (this.validateName(this.output)) {
                handler(this.outputClean);
                this.output = '';
            }
        });
    }

    registerDeleteInputHandler(handler) {
        this.deleteInputHandler = handler;
    }

    registerDeleteOutputHandler(handler) {
        this.deleteOutputHandler = handler;
    }
    
    
    validateName(name) {
        if (name == null || name.trim() == '') {
            alert('Name cannot be blank.');
            return false;
        }
        if (!Utility.ValidName(name.trim())) {
            alert('Name can only start with an alphabetical or underscore character, and continue with alphanumerical or underscore characters.');
            return false;
        }
        
        return true;
    }
    
    updateInterface(inputs, outputs) {
        // Display system inputs and outputs.
        this.updatePorts(this.systemInputs, inputs, this.setupDeleteInputButtonListener);
        this.updatePorts(this.systemOutputs, outputs, this.setupDeleteOutputButtonListener);
    }
    
    // Updates the HTML list element with system ports and delete button.
    updatePorts(element, ports, setupDeleteButtonListener) {    
        element.selectAll('*').remove();
        
        const thisRef = this;
        
        element
            .selectAll('li')
            .data(ports)
            .enter()
            .append('li')
                .html(port => `<span>${port.name}</span> ${Utility.AddDeleteButton(this.ElementIdPrefix, port.name)}`)
            .on('click', function(event, data) {
                element.node().querySelectorAll('li')
                    .forEach((port) => {
                        if (port !== this) { port.classList.remove('systemPortSelected'); }
                    });
                this.classList.toggle('systemPortSelected');
            });

        for (const port of ports) {
            setupDeleteButtonListener.bind(this)(`${port.name}`);
        }
    }

    
    toString() {
        return "ViewInterface";
    }
}

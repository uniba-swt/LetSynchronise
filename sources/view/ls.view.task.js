'use strict';

class ViewTask {
    constructor() {
        this.root = document.querySelector('#view-task');
        this.nameField = this.root.querySelector('#name');
        this.submitButton = this.root.querySelector('#submit');
    }
    
    get name() {
        return this.nameField.value;
    }
    
    registerSubmitHandler(handler) {
        this.submitButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Package all the task paramters into an object.
            let taskParameters = {'name': this.name};
            
            // Call the handler.
            handler(taskParameters);
        });
    }
    
    toString() {
        return "ViewTask";
    }
}

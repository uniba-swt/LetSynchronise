'use strict';

class ViewSchedule {
    root = null;
    
    updateButton = null;
    
    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        this.updateButton = this.root.querySelector('#update');
        
        this.schedule = d3.select('#view-schedule');
        
        this.setupUpdateButtonListener();
    }

    // -----------------------------------------------------
    // Setup listeners
    
    setupUpdateButtonListener() {
        this.updateButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            this.schedule.text('Schedule to be added.');
        });
    }

    toString() {
        return "ViewSchedule";
    }
}

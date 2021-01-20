'use strict';

class ViewSchedule {
    root = null;
    
    updateButton = null;
    
    schedule = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        // Update the static schedule
        this.updateButton = this.root.querySelector('#update');
        
        this.schedule = d3.select('#view-schedule');
    }

    // -----------------------------------------------------
    // Setup listeners
    
    registerUpdateHandler(handler) {
        this.updateButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            this.schedule.text('Schedule to be added.');
            handler(this.updateSchedule);
        });
    }
    
    updateSchedule(taskParametersSet) {
        console.log('here');
    }

    toString() {
        return "ViewSchedule";
    }
}

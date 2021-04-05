'use strict';

class ViewAnalyse {
    root = null;
    analyseButton = null;
    updateButton = null;
    
    constructor() {
        this.root = document.querySelector('#nav-analyse'); 
        // Update the static schedule
        this.updateButton = this.root.querySelector('#update');
        this.analyseButton = this.root.querySelector('#analyse');
    }

    registerUpdateHandler(hander) {
        this.analyseButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            this.updateButton.click(); //todo: need to get the updated schedule - what is a better way?
            console.log("Analysis View: clicked");
            hander();
        });
    }

    updateAnalyse() {
        console.log("Analysis View: result");
    }

    toString() {
        return "ViewAnalyse";
    }
    
}
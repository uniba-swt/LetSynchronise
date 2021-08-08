'use strict';

class ViewAnalyse {
    root = null;
    
    analyseButton = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-analyse'); 
        
        // Analyse the static schedule
        this.analyseButton = this.root.querySelector('#analyse');
    }


    // -----------------------------------------------------
    // Registration of handlers from the controller

    registerAnalyseHandler(hander) {
        this.analyseButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            hander();
        });
    }

    async updateAnalyse(promise) {
        console.log("Analysis View: display result");
    }

    toString() {
        return "ViewAnalyse";
    }
    
}
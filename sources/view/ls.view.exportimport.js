'use strict';

class ViewExportImport {
    root = null;

    exportButton = null;
    importButton = null;
    resetButton = null;
    
    importSelector = null;


    constructor() {
        this.root = document.querySelector('#nav-design');

        // System export or import
        this.exportButton = this.root.querySelector('#export-system');
        this.importButton = this.root.querySelector('#import-system');
        this.resetButton = this.root.querySelector('#reset-system');

        this.importSelector = this.root.querySelector('#import-system-file');
    }
    
    // -----------------------------------------------------
    // Registration of handlers from the controller
    
    registerExportButtonHandler(handler) {
        this.exportButton.addEventListener('click', event => {
            event.preventDefault();
            handler();
        });
    }

    registerImportButtonHandler(handler) {
        this.importButton.addEventListener('click', event => {
            event.preventDefault(); 
            
			if (this.importSelector.files.length < 1) {
				alert("Select a system JSON file!");
				return;
			}
		
			const fileReader = new FileReader();
			fileReader.readAsText(this.importSelector.files.item(0));
		
			fileReader.onload = (event) => { 
				const result = JSON.parse(event.target.result);
	            handler(result);
			}
        });
    }
    
    registerResetButtonHandler(handler) {
        this.resetButton.addEventListener('click', event => {
            event.preventDefault();
            handler();
        });
    }
    
    toString() {
    	return "ViewExportImport";
    }
}
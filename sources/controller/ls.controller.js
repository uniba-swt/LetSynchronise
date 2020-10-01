'use strict';

class Controller {
	model = null;
	view = null;
	
    constructor() { }
    
    setView(view) {
    	this.view = view;
    }
    
    setModel(model) {
    	this.model = model;
    }
    
    toString() {
    	return `Controller has ${this.view.toString()} and ${this.model}`;
    }
    
}

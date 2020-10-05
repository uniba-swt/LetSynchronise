'use strict';

class ControllerSchedule {
    _view = null;
    _model = null;
    
    constructor() { }

    set view(view) {
        this._view = view;
    }

    get view() {
        return this._view;
    }
    
    set model(model) {
        this._model = model;
    }
    
    get model() {
        return this._model;
    }

    toString() {
    	return `ControllerSchedule with ${this.view} and ${this.model}`;
    }
}

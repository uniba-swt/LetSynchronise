'use strict';

class View {
    _viewTask = null;
    _viewDependencies = null;
    _viewSchedule = null;
    
    constructor() { }
    
    set viewTask(viewTask) {
        this._viewTask = viewTask;
    }

    set viewDependencies(viewDependencies) {
        this._viewDependencies = viewDependencies;
    }
    
    set viewSchedule(viewSchedule) {
        this._viewSchedule = viewSchedule;
    }
    
    get viewTask() {
        return this._viewTask;
    }
    
    get viewDependencies() {
        return this._viewDependencies;
    }
    
    get viewSchedule() {
        return this._viewSchedule;
    }
    
    toString() {
    	return "View";
    }
}


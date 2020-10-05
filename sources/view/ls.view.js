'use strict';

class View {
    viewTask = null;
    viewDependencies = null;
    viewSchedule = null;
    
    constructor() { }
    
    set viewTask(viewTask) {
        this.viewTask = viewTask;
    }

    set viewDependencies(viewDependencies) {
        this.viewDependencies = viewDependencies;
    }
    
    set viewSchedule(viewSchedule) {
        this.viewSchedule = viewSchedule;
    }
    
    get viewTask() {
        return this.viewTask;
    }
    
    get viewDependencies() {
        return this.viewDependencies;
    }
    
    get viewSchedule() {
        return this.viewSchedule;
    }
    
    toString() {
    	return "View";
    }
}


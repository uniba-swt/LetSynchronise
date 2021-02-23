'use strict';

class View {
    _viewTask = null;
    _viewDependencies = null;
    _viewSchedule = null;
    _viewConstraints = null;
    
    constructor() { }
    
    // -----------------------------------------------------
    // Static constants.
    
    static get Width()      { return window.innerWidth - 40; }
    static get SvgPadding() { return 10; }
    static get TaskHeight() { return 110; }
    static get BarHeight()  { return 20; }
    static get BarMargin()  { return 1; }
    static get TickHeight() { return 6; }

    
    // -----------------------------------------------------
    // Normal getters and setters
    
    set viewTask(viewTask) {
        this._viewTask = viewTask;
    }

    set viewDependencies(viewDependencies) {
        this._viewDependencies = viewDependencies;
    }
    
    set viewSchedule(viewSchedule) {
        this._viewSchedule = viewSchedule;
    }
    
    set viewConstraints(viewConstraints) {
        this._viewConstraints = viewConstraints;
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
    
    get viewConstraints() {
        return this._viewConstraints;
    }
    
    toString() {
    	return "View";
    }
}


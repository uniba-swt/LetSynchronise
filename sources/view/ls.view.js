'use strict';

class View {
    _viewExportImport = null;
    _viewTask = null;
    _viewDependency = null;
    _viewSchedule = null;
    _viewConstraint = null;
    
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
    
    set viewExportImport(viewExportImport) {
        this._viewExportImport = viewExportImport;
    }
    
    set viewTask(viewTask) {
        this._viewTask = viewTask;
    }

    set viewDependency(viewDependency) {
        this._viewDependency = viewDependency;
    }
    
    set viewSchedule(viewSchedule) {
        this._viewSchedule = viewSchedule;
    }
    
    set viewConstraint(viewConstraint) {
        this._viewConstraint = viewConstraint;
    }
    
    get viewExportImport() {
        return this._viewExportImport;
    }
    
    get viewTask() {
        return this._viewTask;
    }
    
    get viewDependency() {
        return this._viewDependency;
    }
    
    get viewSchedule() {
        return this._viewSchedule;
    }
    
    get viewConstraint() {
        return this._viewConstraint;
    }
    
    toString() {
        return "View";
    }
}


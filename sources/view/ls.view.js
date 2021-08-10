'use strict';

class View {
    _viewExportImport = null;
    _viewInterface = null;
    _viewTask = null;
    _viewDependency = null;
    _viewSchedule = null;
    _viewConstraint = null;
    _viewEventChain = null;
    
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
    
    set viewInterface(viewInterface) {
        this._viewInterface = viewInterface;
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
    
    set viewEventChain(viewEventChain) {
        this._viewEventChain = viewEventChain;
    }
    
    get viewExportImport() {
        return this._viewExportImport;
    }
    
    get viewInterface() {
        return this._viewInterface;
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

    get viewEventChain() {
        return this._viewEventChain;
    }
    
    toString() {
        return "View";
    }
}


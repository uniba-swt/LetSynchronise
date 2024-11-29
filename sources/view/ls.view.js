'use strict';

class View {
    _viewExportImport = null;
    _viewDevice = null;
    _viewCore = null;
    _viewInterface = null;
    _viewTask = null;
    _viewDependency = null;
    _viewEventChain = null;
    _viewConstraint = null;
    _viewSchedule = null;
    
    constructor() { }
    
    // -----------------------------------------------------
    // Static constants.
    
    static get Width()            { return window.innerWidth - 40; }
    static get SvgPadding()       { return 10; }
    static get TaskHeight()       { return 110; }
    static get ExecutionHeight()  { return 10; }
    static get BarHeight()        { return 20; }
    static get BarMargin()        { return 1; }
    static get TickHeight()       { return 6; }

    static get ArrowSeparator()   { return '→' };
    
    // -----------------------------------------------------
    // Normal getters and setters
    
    set viewExportImport(viewExportImport) {
        this._viewExportImport = viewExportImport;
    }

    set viewDevice(viewDevice) {
        this._viewDevice = viewDevice;
    }
    
    set viewCore(viewCore) {
        this._viewCore = viewCore;
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

    get viewDevice() {
        return this._viewDevice
    }
    
    get viewCore() {
        return this._viewCore;
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


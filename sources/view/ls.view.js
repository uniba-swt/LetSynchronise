'use strict';

class View {
    _viewExportImport = null;
    _viewDevice = null;
    _viewCore = null;
    _viewNetworkDelay = null;
    _viewInterface = null;
    _viewEntity = null;
    _viewDependency = null;
    _viewEventChain = null;
    _viewConstraint = null;
    _viewSchedule = null;
    
    constructor() { }
    
    // -----------------------------------------------------
    // Static constants.
    
    static get Width()            { return window.innerWidth - 40; }
    static get SvgPadding()       { return 10; }
    static get EntityHeight()     { return 110; }
    static get DelayHeight()      { return 110; }
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

    set viewNetworkDelay(viewNetworkDelay) {
        this._viewNetworkDelay = viewNetworkDelay;
    }
    
    set viewInterface(viewInterface) {
        this._viewInterface = viewInterface;
    }

    set viewEntity(viewEntity) {
        this._viewEntity = viewEntity;
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

    get viewNetworkDelay() {
        return this._viewNetworkDelay;
    }
    
    get viewInterface() {
        return this._viewInterface;
    }
    
    get viewEntity() {
        return this._viewEntity;
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


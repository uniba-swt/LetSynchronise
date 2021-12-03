'use strict';

class PluginExporter {
    static Category = class {
        static get LetSynchronise()  { return 'LetSynchronise'; }    // Export to a LetSynchronise JSON file
        static get External()        { return 'External'; }          // Export to an external tool
    }
    

    
    static plugins = [];
    
    static reset() {
        plugins = [];
    }
    
    static register(name, func) {
        plugins[name] = func;
    }
}
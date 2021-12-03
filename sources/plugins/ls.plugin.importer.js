'use strict';

class Importer {
    static Category = class {
        static get LetSynchronise()  { return 'LetSynchronise'; }    // Importer for LetSynchronise JSON files
        static get External()        { return 'External'; }          // Importer for externally generated files
    }
    

    
    static plugins = [];
    
    static reset() {
        plugins = [];
    }
    
    static register(name, func) {
        plugins[name] = func;
    }
}
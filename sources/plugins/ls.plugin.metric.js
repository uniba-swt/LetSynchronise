'use strict';

class Metric {
    static get Categories()   { 
        return [
            'Importer',             // Gives the plug-in control of the database
            'Exporter',             // Gives the plug-in a copy of the database
            'EventChainInstance',   // Gives the plug-in an event chain instance
            'ExternalAnalyser'      // Gives the plug-in a copy of the database and waits for an external analyser to return results
        ]; 
    }
    
    static plugins = [];
    
    static reset() {
        plugins = [];
    }
    
    static register(name, func) {
        plugins[name] = func;
    }
}
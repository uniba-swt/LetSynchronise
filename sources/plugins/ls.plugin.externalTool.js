'use strict';

class ExternalTool {
    static Category = class {
        static get Analsyer()  { return 'Analsyer'; }    // External tool is an (timing, utility, ...) analyser
        static get Generator() { return 'Generator'; }   // External tool is a (task, dependency, event chain, constraint, ...) generator
    }
    

    
    static plugins = [];
    
    static reset() {
        plugins = [];
    }
    
    static register(name, func) {
        plugins[name] = func;
    }
}
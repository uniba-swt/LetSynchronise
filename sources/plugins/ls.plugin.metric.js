'use strict';

class Metric {
    static Category = class {
        static get Timing()  { return 'Timing'; }    // Metric is about a timing property
        static get Utility() { return 'Utility'; }   // Metric is about a utility property
    }
    
    static Input = class {
        static get ChainInstances() { return 'ChainInstances'; }
    }
    
    static Output = class {
        static get Latencies() { return 'Latencies'; }
        static get DataAges()  { return 'DataAges'; }
    }
    
    static plugins = [];
    
    static reset() {
        plugins = [];
    }
    
    static register(name, func) {
        plugins[name] = func;
    }
}
'use strict';

class PluginMetric {
    // Enumerations
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
    
    
    // Plugin methods
    static storedPlugins = { };
    
    static getPlugin(name) {
        return PluginMetric.storedPlugins[name];
    }
    
    static get plugins() {
        return PluginMetric.storedPlugins;
    }
    
    static ofCategory(category) {
        return Object.fromEntries(Object.entries(PluginMetric.plugins).filter(([name, plugin]) => plugin.Category == category));
    }
    
    static ofOutput(plugins, output) {
        return Object.fromEntries(Object.entries(plugins).filter(([name, plugin]) => plugin.Output == output));
    }
    
    static reset() {
        PluginMetric.storedPlugins = { };
    }
    
    static register(name, plugin) {
        PluginMetric.storedPlugins[name] = plugin;
    }
    
    static toString() {
        return 'Plug-ins loaded ...\n  ' + Object.keys(PluginMetric.plugins).join(',\n  ');
    }
    
    
    // Return the values of a key-value object
    static valuesOfObject(object) {
        return Object.keys(object).map(instance => object[instance]);
    }
    
    // Mathematical operations
    static min(array) {
        return (array.length == 0) ? undefined : Math.min(...array);
    }
    
    static avg(array) {
        return (array.length == 0) ? undefined : array.reduce((a, b) => (a + b)) / array.length;
    }
    
    static max(array) {
        return (array.length == 0) ? undefined : Math.max(...array);
    }
}

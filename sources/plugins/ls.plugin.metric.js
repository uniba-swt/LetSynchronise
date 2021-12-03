'use strict';

class PluginMetric {
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
    
    
    static storedPlugins = { };
    
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
        return Object.keys(PluginMetric.plugins).join(', ');
    }
}
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
    static StoredPlugins = { };
    
    static GetPlugin(name) {
        return PluginMetric.StoredPlugins[name];
    }
    
    static get Plugins() {
        return PluginMetric.StoredPlugins;
    }
    
    static OfCategory(category) {
        return Object.fromEntries(Object.entries(PluginMetric.Plugins).filter(([name, plugin]) => plugin.Category == category));
    }
    
    static OfOutput(plugins, output) {
        return Object.fromEntries(Object.entries(plugins).filter(([name, plugin]) => plugin.Output == output));
    }
    
    static Reset() {
        PluginMetric.StoredPlugins = { };
    }
    
    static Register(Plugin) {
        PluginMetric.StoredPlugins[Plugin.Name] = Plugin;
    }
    
    static ToString() {
        return 'PluginMetric loaded ...\n  ' + Object.keys(PluginMetric.Plugins).join(',\n  ');
    }
    
    
    // Return the values of a key-value object
    static ValuesOfObject(object) {
        return Object.keys(object).map(instance => object[instance]);
    }
    
    // Mathematical operations
    static Min(array) {
        return (array.length == 0) ? undefined : Math.min(...array);
    }
    
    static Avg(array) {
        return (array.length == 0) ? undefined : array.reduce((a, b) => (a + b)) / array.length;
    }
    
    static Max(array) {
        return (array.length == 0) ? undefined : Math.max(...array);
    }
}

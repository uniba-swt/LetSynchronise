'use strict';

// TODO: Replace Tool1 and Xml1 with actual tools and file types.

class PluginImporter {
    static Category = class {
        static get Native() { return 'Native'; }    // Importer for native LetSynchronise JSON files
        static get Tool1()  { return 'Tool1'; }     // Importer for Tool1 generated files
    }

    static Input = class {
        static get Json() { return 'Json'; }
        static get Xml1() { return 'Xml1'; }
    }
    
    static Output = class {
        static get Json() { return 'Json'; }
    }


    // Plugin methods
    static StoredPlugins = { };
    
    static GetPlugin(name) {
        return PluginImporter.StoredPlugins[name];
    }
    
    static get Plugins() {
        return PluginImporter.StoredPlugins;
    }
    
    static OfCategory(category) {
        return Object.fromEntries(Object.entries(PluginImporter.Plugins).filter(([name, plugin]) => plugin.Category == category));
    }
    
    static OfOutput(plugins, output) {
        return Object.fromEntries(Object.entries(plugins).filter(([name, plugin]) => plugin.Output == output));
    }
    
    static Reset() {
        PluginImporter.StoredPlugins = { };
    }
    
    static Register(name, plugin) {
        PluginImporter.StoredPlugins[name] = plugin;
    }
    
    static ToString() {
        return 'PluginImporter loaded ...\n  ' + Object.keys(PluginImporter.Plugins).join(',\n  ');
    }

}
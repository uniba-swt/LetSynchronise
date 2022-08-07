'use strict';

class PluginExporter {
    static Category = class {
        static get LetSynchronise()  { return 'LetSynchronise'; }    // Export to a LetSynchronise JSON file
        static get External()        { return 'External'; }          // Export to an external tool
    }
    
    static Output = class {
        static get Json() { return 'Json'; }
    }
    

    // Plugin methods.
    static StoredPlugins = { };
    
    static GetPlugin(name) {
        return PluginExporter.StoredPlugins[name];
    }
    
    static get Plugins() {
        return PluginExporter.StoredPlugins;
    }
    
    static OfCategory(category) {
        return Object.fromEntries(Object.entries(PluginExporter.Plugins).filter(([name, plugin]) => plugin.Category == category));
    }
    
    static OfOutput(plugins, output) {
        return Object.fromEntries(Object.entries(plugins).filter(([name, plugin]) => plugin.Output == output));
    }
    
    static Reset() {
        PluginExporter.StoredPlugins = { };
    }
    
    static Register(Plugin) {
        PluginExporter.StoredPlugins[Plugin.Name] = Plugin;
    }
    
    
    // Plugin helper methods.
    static _ModelDatabase = null;
    
    static set ModelDatabase(ModelDatabase) {
        PluginExporter._ModelDatabase = ModelDatabase;
    }
    
    static get ModelDatabase() {
        return PluginExporter._ModelDatabase;
    }
    
    static get DatabaseContents() {
        return PluginImporter.ModelDatabase.exportSystem(Model.ShortStoreNames);
    }
    
    static DatabaseContentsGet(elementsSelected) {
        return PluginExporter.ModelDatabase.exportSystem(elementsSelected);
    }
    
    
    static ToString() {
        return 'PluginExporter loaded ...\n  ' + Object.keys(PluginExporter.Plugins).join(',\n  ');
    }

}

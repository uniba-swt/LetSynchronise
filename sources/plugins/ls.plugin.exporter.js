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
        return this.StoredPlugins[name];
    }
    
    static get Plugins() {
        return this.StoredPlugins;
    }
    
    static OfCategory(category) {
        return Object.fromEntries(Object.entries(this.Plugins).filter(([name, plugin]) => plugin.Category == category));
    }
    
    static OfOutput(plugins, output) {
        return Object.fromEntries(Object.entries(plugins).filter(([name, plugin]) => plugin.Output == output));
    }
    
    static Reset() {
        this.StoredPlugins = { };
    }
    
    static Register(Plugin) {
        this.StoredPlugins[Plugin.Name] = Plugin;
    }
    
    
    // Plugin helper methods.
    static _ModelDatabase = null;
    
    static set ModelDatabase(ModelDatabase) {
        this._ModelDatabase = ModelDatabase;
    }
    
    static get ModelDatabase() {
        return this._ModelDatabase;
    }
    
    static get DatabaseContents() {
        return this.ModelDatabase.exportSystem(Model.ShortStoreNames);
    }
    
    static DatabaseContentsGet(elementsSelected) {
        return this.ModelDatabase.exportSystem(elementsSelected);
    }
    
    
    static ToString() {
        return 'PluginExporter loaded ...\n  ' + Object.keys(PluginExporter.Plugins).join(',\n  ');
    }

}

'use strict';

// TODO: Replace Tool1 and Xml1 with actual tools and file types.

class PluginImporter {
    static Category = class {
        static get Native() { return 'Native'; }   // Importer for native LetSynchronise JSON files
        static get Tool1()  { return 'Tool1'; }    // Importer for Tool1 generated files
        static get TudE2e() { return 'TudE2e'; }   // Importer for TU Dortmund End-to-End analyser
    }

    static Input = class {
        static get Json() { return 'Json'; }
        static get Xml1() { return 'Xml1'; }
        static get Txt()  { return 'Txt'; }
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
    
    
    static ToString() {
        return 'PluginImporter loaded ...\n  ' + Object.keys(this.Plugins).join(',\n  ');
    }

}

'use strict';

class PluginAutoSync {
    static Category = class {
        static get End2EndMax() { return 'End2EndMax'; }
        static get End2EndMin() { return 'End2EndMin'; }
        static get DataAgeMax() { return 'DataAgeMax'; }
        static get DataAgeMin() { return 'DataAgeMin'; }
        static get Random()     { return 'Random'; }
    }


    // Plugin methods.
    static StoredPlugins = { };
    
    static GetPlugin(name) {
        return PluginAutoSync.StoredPlugins[name];
    }
    
    static get Plugins() {
        return PluginAutoSync.StoredPlugins;
    }
    
    static OfCategory(category) {
        return Object.fromEntries(Object.entries(PluginAutoSync.Plugins).filter(([name, plugin]) => plugin.Category == category));
    }
    
    static OfOutput(plugins, output) {
        return Object.fromEntries(Object.entries(plugins).filter(([name, plugin]) => plugin.Output == output));
    }
    
    static Reset() {
        PluginAutoSync.StoredPlugins = { };
    }
    
    static Register(Plugin) {
        PluginAutoSync.StoredPlugins[Plugin.Name] = Plugin;
    }
    
    
    // Plugin helper methods.
    static _ModelDatabase = null;
    
    static set ModelDatabase(ModelDatabase) {
        PluginAutoSync._ModelDatabase = ModelDatabase;
    }
    
    static get ModelDatabase() {
        return PluginAutoSync._ModelDatabase;
    }
    
    static get DatabaseContents() {
        return PluginImporter.ModelDatabase.exportSystem(Model.ShortStoreNames);
    }
    
    static DatabaseContentsGet(elementsSelected) {
        return PluginAutoSync.ModelDatabase.exportSystem(elementsSelected);
    }
    
    static DatabaseContentsSet(system, elementsSelected) {
        return PluginAutoSync.ModelDatabase.importSystem(system, elementsSelected);
    }
    
    static DatabaseContentsDelete(elementsSelected) {
        return PluginAutoSync.ModelDatabase.deleteSystem(elementsSelected);
    }
    
    
    static ToString() {
        return 'PluginAutoSync loaded ...\n  ' + Object.keys(PluginAutoSync.Plugins).join(',\n  ');
    }

}

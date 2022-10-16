'use strict';

class PluginAutoSync {
    static Category = class {
        static get Goal()      { return 'Goal'; }
        static get Scheduler() { return 'Scheduler'; }
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
    static _ModelSchedule = null;
    
    static set ModelDatabase(ModelDatabase) {
        this._ModelDatabase = ModelDatabase;
    }
    
    static get ModelSchedule() {
        return this._ModelSchedule;
    }
    
    static set ModelSchedule(ModelSchedule) {
        this._ModelSchedule = ModelSchedule;
    }
    
    static get ModelDatabase() {
        return this._ModelDatabase;
    }
    
    static get DatabaseContents() {
        return PluginImporter.ModelDatabase.exportSystem(Model.ShortStoreNames);
    }
    
    static DatabaseContentsGet(elementsSelected) {
        return this.ModelDatabase.exportSystem(elementsSelected);
    }
    
    static DatabaseContentsSet(system, elementsSelected) {
        return this.ModelDatabase.importSystem(system, elementsSelected);
    }
    
    static DatabaseContentsDelete(elementsSelected) {
        return this.ModelDatabase.deleteSystem(elementsSelected);
    }
    

    // Scheduler helper methods.
    static DeleteSchedule() {
        return this.ModelDatabase.deleteSchedule();
    }
    
    static CreateTaskInstances(taskParameters, makespan, executionTiming) {
        return this.ModelSchedule.createTaskInstances(taskParameters, makespan, executionTiming)
    }
    
    static CreateAllTaskInstances(makespan, executionTiming) {
        return this.ModelSchedule.createAllTaskInstances(makespan, executionTiming);
    }
    
    static CreateAllDependencyAndEventChainInstances(makespan) {
        return this.ModelSchedule.createAllDependencyAndEventChainInstances(makespan);
    }
    
    static GetSchedule() {
        return this.ModelSchedule.getSchedule();
    }
    

    static ToString() {
        return 'PluginAutoSync loaded ...\n  ' + Object.keys(this.Plugins).join(',\n  ');
    }

}

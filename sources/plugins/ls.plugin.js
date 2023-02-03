'use strict';


class Plugin {
    static Type = class {
        static get Importer()  { return 'Importer'; }
        static get Exporter()  { return 'Exporter'; }
        static get Metric()    { return 'Metric'; }
        static get Scheduler() { return 'Scheduler'; }
        static get Goal()      { return 'Goal'; }
    }

    static Category = class {
        // Importer
        // TODO: Replace Tool1 and Xml1 with actual tools and file types.
        static get Native() { return 'Native'; }   // Import from native LetSynchronise JSON files
        static get Tool1()  { return 'Tool1'; }    // Import from Tool1 generated files
        static get TudE2e() { return 'TudE2e'; }   // Import from TU Dortmund End-to-End analyser
        
        // Exporter
        static get LetSynchronise()  { return 'LetSynchronise'; }    // Export to a LetSynchronise JSON file
        static get External()        { return 'External'; }          // Export to an external tool

        // Metric
        static get Timing()  { return 'Timing'; }    // Metric for a timing property
        static get Utility() { return 'Utility'; }   // Metric for a utility property
        
        // Scheduler
        static get Preemptive() { return 'Preemptive'; }        // Preemptive scheduling policy
        static get Preemptive() { return 'Non-Preemptive'; }    // Non-preemptive scheduling policy
        static get Preemptive() { return 'Identity'; }          // No scheduling policy
        
        // Goal
        static get ResponseTime() { return 'Response Time'; }   // Optimise for response times
    }

    static Input = class {
        // Importer
        static get Json() { return 'Json'; }
        static get Xml1() { return 'Xml1'; }
        static get Txt()  { return 'Txt'; }

        // Metric
        static get ChainInstances() { return 'ChainInstances'; }
    }
    
    static Output = class {
        // Importer and Exporter
        static get Json() { return 'Json'; }

        // Metric
        static get Latencies() { return 'Latencies'; }
        static get DataAges()  { return 'DataAges'; }
    }


    // Plugin methods.
    static StoredPlugins = { };
    
    static GetPlugin(type, name) {
        return this.StoredPlugins[type][name];
    }
    
    static get Plugins() {
        return this.StoredPlugins;
    }
    
    static OfType(type) {
        return this.Plugins[type];
    }
    
    static OfTypeAndCategory(type, category) {
        return Object.fromEntries(Object.entries(this.Plugins[type]).filter(([name, plugin]) => plugin.Category == category));
    }
    
    static OfOutput(plugins, output) {
        return Object.fromEntries(Object.entries(plugins).filter(([name, plugin]) => plugin.Output == output));
    }
    
    static Reset() {
        this.StoredPlugins = { };
        this.StoredPlugins[Plugin.Type.Importer] = {};
        this.StoredPlugins[Plugin.Type.Exporter] = {};
        this.StoredPlugins[Plugin.Type.Metric] = {};
        this.StoredPlugins[Plugin.Type.Scheduler] = {};
        this.StoredPlugins[Plugin.Type.Goal] = {};
    }
    
    static Register(Plugin) {
        this.StoredPlugins[Plugin.Type][Plugin.Name] = Plugin;
    }
    
    
    // Plugin helper methods.
    static _ModelDatabase = null;
    static _ModelSchedule = null;
    
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
    
    static DatabaseContentsSet(system, elementsSelected) {
        return this.ModelDatabase.importSystem(system, elementsSelected);
    }
    
    static DatabaseContentsDelete(elementsSelected) {
        return this.ModelDatabase.deleteSystem(elementsSelected);
    }
    
    static get ModelSchedule() {
        return this._ModelSchedule;
    }
    
    static set ModelSchedule(ModelSchedule) {
        this._ModelSchedule = ModelSchedule;
    }
    
    static ToString() {
        return 'Plugins loaded ...\n' +
            Object.entries(this.Plugins)
              .map(([type, plugins]) => `  ${type}:\n    ` + Object.keys(plugins)
            .join(',\n    ')).join('\n');
    }


    // Metric helper methods.

    // Return the values of a key-value object.
    static ValuesOfObject(object) {
        return Object.keys(object).map(instance => object[instance]);
    }
    
    // Mathematical operations.
    static Min(array) {
        return (array.length == 0) ? undefined : Math.min(...array);
    }
    
    static Avg(array) {
        return (array.length == 0) ? undefined : array.reduce((a, b) => (a + b)) / array.length;
    }
    
    static Max(array) {
        return (array.length == 0) ? undefined : Math.max(...array);
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
}

'use strict';

class PluginExporterNative {
    // Plug-in Metadata
    static get Name()     { return 'LetSynchronise'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Type()     { return Plugin.Type.Exporter; }
    static get Category() { return Plugin.Category.Native; }
    static get Output()   { return Plugin.Output.Json; }

    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns a native JSON representation of a given system.
    //
    // @Input system elements selected for export.
    // @Output system defined in the native JSON format.
    static async Result(elementsSelected) {
        const system = await Plugin.DatabaseContentsGet(elementsSelected);
        return JSON.stringify(system);
    }
    
}

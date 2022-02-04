'use strict';

class PluginImporterNative {
    // Plug-in Metadata
    static get Name()     { return 'LetSynchronise'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginImporter.Category.Native; }
    static get Input()    { return PluginImporter.Input.Json; }
    static get Output()   { return PluginImporter.Output.Json; }

    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns a native JSON representation of a given system.
    //
    // @Input system defined in native JSON format.
    // @Output system defined in the native JSON format.
    static async Result(rawSystem) {
        // Simply returns the system.
        
        return JSON.parse(rawSystem);
    }
    
}

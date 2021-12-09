'use strict';

class PluginImporterTool1 {
    // Plug-in Metadata
    static get Name()     { return 'Tool1'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginImporter.Category.Tool1; }
    static get Input()    { return PluginImporter.Input.Xml1; }
    static get Output()   { return PluginImporter.Output.Json; }

    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns a native JSON representation of a given system.
    //
    // @Input system defined in XML1 format.
    // @Output system defined in the native JSON format.
    static Result(system) {
        let json = '';
        
        // TODO: Walk through system and generate the required json.
        
        return json;
    }
    
    
}
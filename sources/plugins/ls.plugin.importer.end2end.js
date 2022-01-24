'use strict';

class PluginImporterEnd2End {
    // Plug-in Metadata
    static get Name()     { return 'End2End'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Category() { return PluginImporter.Category.End2End; }
    static get Input()    { return PluginImporter.Input.Txt; }
    static get Output()   { return PluginImporter.Output.Json; }

    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns a native JSON representation of a given system.
    //
    // @Input system defined in TXT format.
    // @Output system defined in the native JSON format.
    static Result(system) {
        let json = '';
        console.log(system)
        // TODO: Walk through system and generate the required json.
        alert(this.Name);
        
        return json;
    }
    
    
}

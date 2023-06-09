'use strict';

class PluginImporterTool1 {
    // Plug-in Metadata
    static get Name()     { return 'Tool1'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Type()     { return Plugin.Type.Importer; }
    static get Category() { return Plugin.Category.Tool1; }
    static get Input()    { return Plugin.Input.Xml1; }
    static get Output()   { return Plugin.Output.Json; }

    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns a native JSON representation of a given system.
    //
    // @Input system defined in XML1 format.
    // @Output system defined in the native JSON format.
    static async Result(rawSystem) {
        // Get a copy of the database contents.
        const databaseContents = await Plugin.DatabaseContents;

        let json = '';
        
        // TODO: Walk through system and generate the required json.
        // TODO: If needed, compare rawSystem contents with existing databaseContents to ensure consistency!
        alert(this.Name);
        
        return json;
    }
    
    
}

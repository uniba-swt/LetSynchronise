'use strict';

class PluginImporterTudE2e {
    // Plug-in Metadata
    static get Name()     { return 'TU Dortmund End-to-End Analyser'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Type()     { return Plugin.Type.Importer; }
    static get Category() { return Plugin.Category.TudE2e; }
    static get Input()    { return Plugin.Input.Txt; }
    static get Output()   { return Plugin.Output.Json; }

    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns a native JSON representation of a given system.
    //
    // @Input system defined in TXT format.
    // @Output system defined in the native JSON format.
    static async Result(rawSystem) {
        const databaseContents = await Plugin.DatabaseContents;
        console.log(databaseContents);
        
        alert(PluginImporterTudE2e.Name);

        // TODO: Parse rawSystem into a JSON string
        // TODO: If needed, compare rawSystem contents with existing databaseContents to ensure consistency!
        const system =
        '{                                  \
            "TaskStore": [                  \
                {                           \
                    "name": "task_a",       \
                    "initialOffset": 0,     \
                    "activationOffset": 1,  \
                    "duration": 2,          \
                    "period": 3,            \
                    "inputs": [ "in" ],     \
                    "outputs": [ "out" ]    \
                }                           \
            ]                               \
        }';
        
        const json = JSON.parse(system)
        console.log(json)

        return json;
    }
    
}

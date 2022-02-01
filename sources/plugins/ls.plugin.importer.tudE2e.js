'use strict';

class PluginImporterTudE2e {
    // Plug-in Metadata
    static get Name()     { return 'TU Dortmund End-to-End Analyser'; }
    static get Author()   { return 'Matthew Kuo'; }
    static get Category() { return PluginImporter.Category.TudE2e; }
    static get Input()    { return PluginImporter.Input.Txt; }
    static get Output()   { return PluginImporter.Output.Json; }

    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns a native JSON representation of a given system.
    //
    // @Input system defined in TXT format.
    // @Output system defined in the native JSON format.
    static Result(rawSystem) {
        alert(PluginImporterTudE2e.Name);

        // TODO: Parse rawSystem into a JSON string
        const system =
        '{                                  \
            "TaskStore": [                  \
                {                           \
                    "name": "task-a",       \
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
# LET Task Schedule

The task schedule is recomputed every time the **Update** button is pressed. 
This means that tasks, dependencies, and event chains are reinstantiated and redrawn. 
This includes assigning random execution times for each task instance.

However, recomputing the entire task schedule is not necessary when task dependencies, event chains, and timing constraints are created, edited, or deleted. 
They have no impact on the task set. 
Only when the tasks are created or edited does the task schedule need to be recomputed.
When this is necessary, the **Update** button will turn red and remain red until it has be clicked, triggering a recomputation of the task schedule.


# System Plugins

Plugins are stateless, static classes that provide LetSynchronise with additional functionality.
Plugins reside in `sources/plugins` and fall into one of the following categories:
* Exporter: Export the LetSynchronise system to a required file format.
  Export plugins are registered and managed by `ls.plugin.exporter.js`.
* Importer: Import systems into LetSynchronise from different file formats.
  Import plugins are registered and managed by `ls.plugin.importer.js`.
* Metric: Compute metrics on LetSynchronise systems, e.g., data age, end-to-end response time, communication latency, and schedulability. 
  Metric plugins are registered and managed by `ls.plugin.metric.js`.
* External Tool: Invoke an external tool and exchange information with LetSynchronise. 
  External tool plugins are registered and managed by `ls.plugin.externalTool.js`.

## Defining an Importer Plugin
Define a new importer plugin in the `plugins` folder, e.g., `ls.plugin.importer.tool1.js` for the importer called **Tool1**.
Plugins have meta-data defined as static properties:
* Name: Descriptive name of the plugin, which will be displayed to the user, e.g., in a menu item.
* Author: Creator of the plugin.
* Category: Suitable classification of the plugin, as defined in `PluginImporter.Category` in `ls.plugin.importer.js`.
* Input: Supported input of the plugin, as defined in `PluginImporter.Input` in `ls.plugin.importer.js`.
* Output: Supported output of the plugin, as defined in `PluginImporter.Output` in `ls.plugin.importer.js`.

Note that the output of all importer plugins shall be `PluginImporter.Output.Json`.

In addition to the meta-data, a minimal importer plugin only needs to define the static method `Result(rawSystem)`
which returns a JSON object:
```javascript
static Result(rawSystem) {
    // Convert rawSystem into a JSON string.
    const jsonString = ' ... ';
    
    // Parse the JSON string into an object.
    return JSON.parse(jsonString);
}
```

This method shall take the input (`rawSystem`) and transform it into an equivalent JSON string that reflects the database structure of LetSynchronise.
The JSON string is then converted into a JSON object using the method `JSON.parse()`. 
LetSynchronise clears its database and stores the JSON object in the database. 

An import plugin may also be used to import LET task schedules, but the plugin shall guarantee that the task, dependency, and event chain instances are consistent with their definitions in the LetSynchronise database (SystemInputStore, SystemOutputStore, TaskStore, DependencyStore, ConstraintStore, EventChainStore).
Note that portions of a task schedule (e.g., only task instances) can be imported without affecting deleting other scheduling information (e.g., dependencies instances).  

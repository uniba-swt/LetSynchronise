# LET Task Set
The task set of a LET system is specified by the user.
Example task sets in JSON format can be found in the `example` folder.


# Task Dependencies
Communication dependencies between tasks are defined from a source (system input or task output)
to a destination (system output or task input).


# LET Task Schedule
The scheduler that will be used to schedule the executions of overlapping tasks is chosen from a list scheduling policy plugins.
The execution times to generate for each task instance can be chosen from BCET, ACET, or WCET.
The task schedule is (re)computed every time the **Update** button is pressed. 
This means that tasks, dependencies, and event chains are (re)instantiated, (re)scheduled, and (re)drawn as a Gantt chart. 

Recomputing the entire task schedule is not necessary when task dependencies, event chains, and timing constraints are created, edited, or deleted,
because they have no impact on the task instances. 
Only when tasks are created or edited does the task schedule need to be recomputed.
When this is necessary, the **Update** button will turn red and remain red until it has be clicked, triggering a recomputation of the task schedule.


# System Plugins
Plugins are stateless, static classes that extend the capabilities of LetSynchronise.
Plugins are registered for use by `sources/plugins/ls.plugin.js`, which also provides a convenience API to access and modify the system model.
Plugins reside in `sources/plugins` and can be one of the following types:
* Exporter: Exports the current system to a required file format.
* Importer: Imports a system into LetSynchronise from different file formats.
* Metric: Computes a metric on the event chains current system, e.g., data age, end-to-end response time, and communication latency. 
* Scheduler: Schedules the current system according to a scheduling policy, e.g., fixed-priority, rate monotonic, or earliest deadline first.
* Goal: Optimises the current system according to a goal, e.g., minimise end-to-end response times.

## Defining a Plugin
Define a new plugin in the `plugins` folder, e.g., `ls.plugin.importer.tool1.js` for a system importer called **Tool1**.
Plugins have meta-data defined as static properties:
* Name: Descriptive name of the plugin, which will be displayed to the user, e.g., in a dropdown item or analysis output.
* Author: Creator of the plugin.
* Type: Suitable classification of the plugin's capabilities as defined in `Plugin.Type` in `ls.plugin.js`.
* Category: Suitable classification of the plugin's functionality as defined in `Plugin.Category` in `ls.plugin.js`.
* Input: Supported input of the plugin as defined in `Plugin.Input` in `ls.plugin.js`.
* Output: Supported output of the plugin as defined in `Plugin.Output` in `ls.plugin.js`.

In addition to the meta-data, a minimal plugin only needs to implement the static method `Result(...)`.
The parameter of this function depends on the plugin type:
* Exporter: 
  * elementsSelected: System elements that the user has selected to export, which can be the system IO, task set, task dependencies, task schedule, event chains, and timing constraints.
* Importer: 
  * rawSystem: Raw file contents of a system to convert and import.
* Metric: 
  * chainName: Name of the event chain to compute metrics for. 
  * chainInstances: Instances of the event chain.
* Scheduler: 
  * makespan: Length of the schedule to simulate.
  * executionTiming: Task execution times to generate (BCET, ACET, or WCET).
* Goal: 
  * scheduler: Chosen scheduling policy to use.
  * makespan: Length of the schedule to simulate.

For example, a simple importer plugin would transform the raw system into a JSON object:
```javascript
static async Result(rawSystem) {
    // Convert rawSystem into a JSON string that reflects the database structure of LetSynchronise.
    const jsonString = this.convert(rawSystem);
    
    // Parse the JSON string into a JSON object.
    return JSON.parse(jsonString);
}
```

An import plugin may also be used to import LET task schedules, but the plugin shall guarantee 
that the instances of tasks, dependencies, and event chains are consistent with their definition in 
the LetSynchronise database (SystemInputStore, SystemOutputStore, TaskStore, DependencyStore, 
ConstraintStore, EventChainStore).


# Implemented Plugins
This section describes the plugins that have been implemented so far.

## Exporter
* `ls.plugin.exporter.native.js`: Exports the system and schedule, i.e., the selected contents 
  of the IndexedDB, into a LetSynchronise model file.

## Importer
* `ls.plugin.importer.native.js`: Imports selected elements of a LetSynchronise model file 
  into the IndexedDB.
* `ls.plugin.importer.tool1.js`: Skeleton that can be used to develop a custom importer.
* `ls.plugin.importer.tudE2e.js`: Planned to import model files created by the 
  [TU Dortmund End-to-End Analyser](https://github.com/mkuo005/end-to-end).

## Metric
* `ls.plugin.metric.dataAge.js`: For a given event chain, returns the data age of each 
  dependency instance and their min, avg, and max data ages. The data age of a dependency instance
  is the time difference between its start and end, i.e., time(LET start of the input task) - 
  time(LET end of the output task). 
* `ls.plugin.metric.end2end.js`: For a given event chain that starts from a system input and 
  ends at a system output, returns the end-to-end response time of each event chain instance 
  and their min, avg, and max response times. The end-to-end response time of an event chain instance
  is the time difference between the system input and system output, i.e., 
  time(system input event) - time(system output event).
* `ls.plugin.metric.latency.js`: For a given event chain, regardless of whether it starts 
  from a system input or ends at a system output, returns the latency of each event chain instance
  and their min, avg, and max latencies. The latency of an event chain instance is the 
  time difference between the end of the first task and the start of the last task, i.e., 
  time(LET start of the last task) - time(LET end of the first task).

## Scheduler
* `ls.plugin.scheduler.edf.js`: Preemptive, Earliest Deadline First scheduling.
* `ls.plugin.scheduler.fp.js`: Preemptive, Fixed Priority scheduling.
* `ls.plugin.scheduler.identity.js`: Does not do any scheduling and does not modify the schedule.
* `ls.plugin.scheduler.random.js`: Non-preemptively schedule tasks without any particular preference.
* `ls.plugin.scheduler.rm.js`: Preemptive, Rate-Monotonic scheduling
* `ls.plugin.scheduler.tudortmund.js`: Non-preemptive scheduling by the external tool
  [TU Dortmund End-to-End Analyser](https://github.com/mkuo005/end-to-end).

## Goal
* `ls.plugin.goal.end2endMax.js`: Maximises end-to-end response times by changing 
  all LET intervals of all tasks to span the entire task period.
* `ls.plugin.goal.end2endMin.js`: Naive heuristic that iteratively minimises the 
  end-to-end response times of all event chains. Constructs a task dependency task
  and considers tasks based on event chain priority.
* `ls.plugin.goal.ilp.js`: Simple minimisation of end-to-end response times by 
  formulating the the problem as an Integer Linear Program (ILP). The task set is 
  sent to an [external tool](https://github.com/mkuo005/LET-LP-Scheduler), which 
  constructs the ILP and returns the solution as a new LetSynchronise model.
* `ls.plugin.goal.random.js`: Randomises the parameters of all LET tasks. 
  Only for demonstration purposes.

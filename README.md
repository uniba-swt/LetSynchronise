# LetSynchronise
LetSynchronise is an extensible, web-based, open-source (GPL3) framework for modelling, 
simulating, analysing, and optimising LET-based systems. It
currently focuses on timing behaviour and does not support the
modelling of, e.g., functional behaviour, data values, or memory
usage. The target audience of LetSynchronise is researchers who
wish to (1) rapidly prototype and experiment with LET scheduling 
policies and optimisations, (2) make solutions and benchmarks
readily accessible, and (3) fairly and accurately reproduce and 
evaluate the results of existing work. 

Paper describing LetSynchronise:
* [E. Yip and M. M. Y. Kuo. _LetSynchronise: An Open-Source Framework for Analysing and Optimising Logical Execution Time Systems_. CPS-IoT Week, 2023](https://dl.acm.org/doi/10.1145/3576914.3587500)

Original authors:
* [@eyip002](https://github.com/eyip002): [Eugene Yip](https://www.uni-bamberg.de/swt/team/dr-eugene-yip/)
* [@mkuo005](https://github.com/mkuo005): [Matthew Kuo](http://matthew.kuo.nz)


## Dependencies
* Web browser that supports [indexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API): System database
* [D3 Data-Driven Documents](https://d3js.org): Charting
* [Bootstrap](https://getbootstrap.com): User interface and layout


## Directory Layout
* dependencies: JavaScript frameworks and libraries
* docs: Documentation on architecture and plugin feature
* playground: Examples to learn JavaScript and frameworks
* sources: Organised into the model-view-controller architecture
   * controller: Links the view and model together
   * model: System model
   * view: User interface
   * plugins: Extensions for importing, exporting, analysing, scheduling, and optimising systems


## Usage
LetSynchronise is designed as a web application that does not require any installation. 
Just open the [`sources/ls.main.html`](sources/ls.main.html) file in a web browser, e.g., Firefox or Safari.
There are two tabs for users to **Design** and then to **Analyse** a LET system.
See the [`docs`](docs) folder for information on the types of plugins that are available 
and can be developed.

Systems can be imported and exported via supported file formats. If only certain
system elements should be imported or exported, these can be selected beforehand 
via tick boxes.

> **Note**   
> LetSynchronise uses a time base of nanoseconds to avoid floating-point rounding errors.

### Platform Tab
* Edit the cores and their speedups
* Edit the memories and their sizes and access latencies

### Design Tab
* Edit the system interface in terms of the environmental inputs and outputs.
* Edit the system's LET task set, and view each task's parameters diagramatically.
* Edit task communication dependencies among the system interface and tasks.

### Analyse Tab
* View the prologue and hyper-period of the task set.
* Define the makespan of the task schedule to simulate.
* Choose a task scheduler that implements the desired scheduling policy.
* Choose the type  of execution times (BCET, ACET, or WCET) to simulate for each task instance.
* Choose an optimisation goal to apply on the system.
* View, zoom, and pan the simulated task schedule, including the overall system load.
* Show or hide each task communication dependency.
* Interactive tooltips appear when the mouse is hovered over each LET interval, execution interval, and task communication dependency.
* Edit event chains, which represent sequences of task communication dependencies.
* Highlight each instance of a selected event chain.
* Define timing constraints on event chains, which will also be analysed during optimisation.
* View analysis results for timing constraints.


## Development
> **Note**   
> Location of original repository: https://github.com/eyip002/LetSynchronise

**Contributions are always welcome!**

LetSynchronise is based on the model-view-controller architecure and details
can be found in the [`docs`](docs) folder. The main logic and plugins are programmed
in JavaScript. The system model and simulated schedule are stored in 
[IndexeDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).
The user interface is styled with [Bootstrap](https://getbootstrap.com).
The simulated schedules are plotted with [D3](https://d3js.org).


### Coding Style
* Indentation: 4 spaces
* Names: camel casing


'use strict';

// Define the model implementations
let model = new Model();
model.modelTask = new ModelTask();
model.modelDependencies = new ModelDependencies();
model.modelSchedule = new ModelSchedule();
model.modelDatabase = new ModelDatabase();

// Define the view implementations
let view = new View();
view.viewTask = new ViewTask();
view.viewDependencies = new ViewDependencies();
view.viewSchedule = new ViewSchedule();

// Define the controller implementations
let controller = new Controller();
controller.controllerTask = new ControllerTask();
controller.controllerDependencies = new ControllerDependencies();
controller.controllerSchedule = new ControllerSchedule();

// Link the models and views to their respective controllers
controller.controllerTask.view = view.viewTask;
controller.controllerTask.model = model.modelTask;
controller.controllerDependencies.view = view.viewDependencies;
controller.controllerDependencies.model = model.modelDependencies;
controller.controllerSchedule.view = view.viewSchedule;
controller.controllerSchedule.model = model.modelSchedule;


console.log(controller.toString());

'use strict';

// Define the model implementations
let model = new Model();
model.modelExportImport = new ModelExportImport();
model.modelTask = new ModelTask();
model.modelDependency = new ModelDependency();
model.modelSchedule = new ModelSchedule();
model.modelConstraint = new ModelConstraint();
model.modelDatabase = new ModelDatabase();

// Define the view implementations
let view = new View();
view.viewExportImport = new ViewExportImport();
view.viewTask = new ViewTask();
view.viewDependency = new ViewDependency();
view.viewSchedule = new ViewSchedule();
view.viewConstraint = new ViewConstraint();

// Define the controller implementations
let controller = new Controller();
controller.controllerExportImport = new ControllerExportImport();
controller.controllerTask = new ControllerTask();
controller.controllerDependency = new ControllerDependency();
controller.controllerSchedule = new ControllerSchedule();
controller.controllerConstraint = new ControllerConstraint();

// Link the models and views to their respective controllers
controller.controllerExportImport.view = view.viewExportImport;
controller.controllerExportImport.model = model.modelExportImport;
controller.controllerExportImport.modelTask = model.modelTask;
controller.controllerExportImport.modelDependency = model.modelDependency;

controller.controllerTask.view = view.viewTask;
controller.controllerTask.model = model.modelTask;
controller.controllerTask.modelDependency = model.modelDependency;

controller.controllerDependency.view = view.viewDependency;
controller.controllerDependency.model = model.modelDependency;
controller.controllerDependency.modelTask = model.modelTask;

controller.controllerSchedule.view = view.viewSchedule;
controller.controllerSchedule.model = model.modelSchedule;
controller.controllerSchedule.modelDependency = model.modelDependency;

controller.controllerConstraint.view = view.viewConstraint;
controller.controllerConstraint.model = model.modelConstraint;
controller.controllerConstraint.modelTask = model.modelTask;


console.log(controller.toString());

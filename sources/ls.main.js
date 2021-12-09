'use strict';

// Define the model implementations.
let model = new Model();
model.modelExportImport = new ModelExportImport();
model.modelInterface = new ModelInterface();
model.modelTask = new ModelTask();
model.modelDependency = new ModelDependency();
model.modelSchedule = new ModelSchedule();
model.modelConstraint = new ModelConstraint();
model.modelEventChain = new ModelEventChain();
model.modelAnalyse = new ModelAnalyse();
model.modelDatabase = new ModelDatabase();

// Define the view implementations.
let view = new View();
view.viewExportImport = new ViewExportImport();
view.viewInterface = new ViewInterface();
view.viewTask = new ViewTask();
view.viewDependency = new ViewDependency();
view.viewSchedule = new ViewSchedule();
view.viewConstraint = new ViewConstraint();
view.viewAnalyse = new ViewAnalyse();
view.viewEventChain = new ViewEventChain();

// Define the controller implementations.
let controller = new Controller();
controller.controllerExportImport = new ControllerExportImport();
controller.controllerInterface = new ControllerInterface();
controller.controllerTask = new ControllerTask();
controller.controllerDependency = new ControllerDependency();
controller.controllerSchedule = new ControllerSchedule();
controller.controllerConstraint = new ControllerConstraint();
controller.controllerEventChain = new ControllerEventChain();
controller.controllerAnalyse = new ControllerAnalyse();

// Link the models and views to their respective controllers.
controller.controllerExportImport.view = view.viewExportImport;
controller.controllerExportImport.model = model.modelExportImport;
controller.controllerExportImport.modelInterface = model.modelInterface;
controller.controllerExportImport.modelTask = model.modelTask;
controller.controllerExportImport.modelDependency = model.modelDependency;
controller.controllerExportImport.modelConstraint = model.modelConstraint;

controller.controllerInterface.view = view.viewInterface;
controller.controllerInterface.model = model.modelInterface;
controller.controllerInterface.modelDependency = model.modelDependency;
controller.controllerInterface.modelConstraint = model.modelConstraint;
controller.controllerInterface.modelEventChain = model.modelEventChain;

controller.controllerTask.view = view.viewTask;
controller.controllerTask.model = model.modelTask;
controller.controllerTask.modelDependency = model.modelDependency;
controller.controllerTask.modelEventChain = model.modelEventChain;

controller.controllerDependency.view = view.viewDependency;
controller.controllerDependency.model = model.modelDependency;
controller.controllerDependency.modelTask = model.modelTask;
controller.controllerDependency.modelInterface = model.modelInterface;
controller.controllerDependency.modelEventChain = model.modelEventChain;

controller.controllerSchedule.view = view.viewSchedule;
controller.controllerSchedule.model = model.modelSchedule;
controller.controllerSchedule.modelDependency = model.modelDependency;

controller.controllerEventChain.view = view.viewEventChain;
controller.controllerEventChain.model = model.modelEventChain;
controller.controllerEventChain.modelDependency = model.modelDependency;
controller.controllerEventChain.modelConstraint = model.modelConstraint;

controller.controllerConstraint.view = view.viewConstraint;
controller.controllerConstraint.model = model.modelConstraint;
controller.controllerConstraint.modelEventChain = model.modelEventChain;

controller.controllerAnalyse.view = view.viewAnalyse;
controller.controllerAnalyse.viewSchedule = view.viewSchedule;
controller.controllerAnalyse.model = model.modelAnalyse;
controller.controllerAnalyse.modelTask = model.modelTask;
controller.controllerAnalyse.modelDependency = model.modelDependency;
controller.controllerAnalyse.modelConstraint = model.modelConstraint;
controller.controllerAnalyse.modelEventChain = model.modelEventChain;
controller.controllerAnalyse.controllerSchedule = controller.controllerSchedule;

console.log(controller.toString());


// Register plug-ins.
PluginImporter.Register(PluginImporterTool1.Name, PluginImporterTool1);

console.log(PluginImporter.ToString())

PluginMetric.Register(PluginMetricDataAge.Name, PluginMetricDataAge);
PluginMetric.Register(PluginMetricEnd2End.Name, PluginMetricEnd2End);
PluginMetric.Register(PluginMetricLatency.Name, PluginMetricLatency);

console.log(PluginMetric.ToString());


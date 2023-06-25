'use strict';

// Define the model implementations.
let model = new Model();
model.modelExportImport = new ModelExportImport();
model.modelCore = new ModelCore();
model.modelMemory = new ModelMemory();
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
view.viewCore = new ViewCore();
view.viewMemory = new ViewMemory();
view.viewInterface = new ViewInterface();
view.viewTask = new ViewTask();
view.viewDependency = new ViewDependency();
view.viewEventChain = new ViewEventChain();
view.viewConstraint = new ViewConstraint();
view.viewSchedule = new ViewSchedule();
view.viewAnalyse = new ViewAnalyse();

// Define the controller implementations.
let controller = new Controller();
controller.controllerExportImport = new ControllerExportImport();
controller.controllerCore = new ControllerCore();
controller.controllerMemory = new ControllerMemory();
controller.controllerInterface = new ControllerInterface();
controller.controllerTask = new ControllerTask();
controller.controllerDependency = new ControllerDependency();
controller.controllerEventChain = new ControllerEventChain();
controller.controllerConstraint = new ControllerConstraint();
controller.controllerSchedule = new ControllerSchedule();
controller.controllerAnalyse = new ControllerAnalyse();

// Link the models and views to their respective controllers.
controller.controllerExportImport.view = view.viewExportImport;
controller.controllerExportImport.model = model.modelExportImport;
controller.controllerExportImport.modelCore = model.modelCore;
controller.controllerExportImport.modelMemory = model.modelMemory;
controller.controllerExportImport.modelInterface = model.modelInterface;
controller.controllerExportImport.modelTask = model.modelTask;
controller.controllerExportImport.modelDependency = model.modelDependency;
controller.controllerExportImport.modelEventChain = model.modelEventChain;
controller.controllerExportImport.modelConstraint = model.modelConstraint;

controller.controllerCore.view = view.viewCore;
controller.controllerCore.model = model.modelCore;

controller.controllerMemory.view = view.viewMemory;
controller.controllerMemory.model = model.modelMemory;

controller.controllerInterface.view = view.viewInterface;
controller.controllerInterface.model = model.modelInterface;
controller.controllerInterface.modelDependency = model.modelDependency;
controller.controllerInterface.modelConstraint = model.modelConstraint;
controller.controllerInterface.modelEventChain = model.modelEventChain;

controller.controllerTask.view = view.viewTask;
controller.controllerTask.viewSchedule = view.viewSchedule;
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
controller.controllerSchedule.modelTask = model.modelTask;
controller.controllerSchedule.modelDependency = model.modelDependency;
controller.controllerSchedule.modelEventChain = model.modelEventChain;
controller.controllerSchedule.modelConstraint = model.modelConstraint;

controller.controllerEventChain.view = view.viewEventChain;
controller.controllerEventChain.model = model.modelEventChain;
controller.controllerEventChain.modelDependency = model.modelDependency;
controller.controllerEventChain.modelConstraint = model.modelConstraint;
controller.controllerEventChain.controllerSchedule = controller.controllerSchedule;

controller.controllerConstraint.view = view.viewConstraint;
controller.controllerConstraint.model = model.modelConstraint;
controller.controllerConstraint.modelEventChain = model.modelEventChain;

controller.controllerAnalyse.view = view.viewAnalyse;
controller.controllerAnalyse.viewSchedule = view.viewSchedule;
controller.controllerAnalyse.model = model.modelAnalyse;
controller.controllerAnalyse.modelConstraint = model.modelConstraint;
controller.controllerAnalyse.modelEventChain = model.modelEventChain;

console.info(controller.toString());


// Initialise plug-in repository.
Plugin.Reset();
Plugin.ModelDatabase = model.modelDatabase;
Plugin.ModelSchedule = model.modelSchedule;

// Register importer plug-ins.
Plugin.Register(PluginImporterNative);
Plugin.Register(PluginImporterTool1);
view.viewExportImport.updateSystemImporters();

// Register exporter plug-ins.
Plugin.Register(PluginExporterNative);

// Register metric plug-ins.
Plugin.Register(PluginMetricDataAge);
Plugin.Register(PluginMetricEnd2End);
Plugin.Register(PluginMetricLatency);

// Register scheduler plug-ins.
Plugin.Register(PluginSchedulerIdentity);
Plugin.Register(PluginSchedulerEdf);
Plugin.Register(PluginSchedulerFp);
Plugin.Register(PluginSchedulerRandom);
Plugin.Register(PluginSchedulerRm);
Plugin.Register(PluginSchedulerTuDortmund);

// Register optimisation goal plug-ins.
Plugin.Register(PluginGoalEnd2EndMax);
Plugin.Register(PluginGoalEnd2EndMin);
Plugin.Register(PluginGoalIlp);
Plugin.Register(PluginGoalRandom);
view.viewSchedule.updateOptimiserPluginSelectors();

console.info(Plugin.ToString());

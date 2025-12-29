'use strict';

// Define the model implementations.
let model = new Model();
model.modelExportImport = new ModelExportImport();
model.modelDevice = new ModelDevice();
model.modelCore = new ModelCore();
model.modelNetworkDelay = new ModelNetworkDelay();
model.modelMemory = new ModelMemory();
model.modelInterface = new ModelInterface();
model.modelEntity = new ModelEntity();
model.modelDependency = new ModelDependency();
model.modelSchedule = new ModelSchedule();
model.modelConstraint = new ModelConstraint();
model.modelEventChain = new ModelEventChain();
model.modelAnalyse = new ModelAnalyse();
model.modelDatabase = new ModelDatabase();

// Define the view implementations.
let view = new View();
view.viewExportImport = new ViewExportImport();
view.viewDevice = new ViewDevice();
view.viewCore = new ViewCore();
view.viewNetworkDelay = new ViewNetworkDelay();
view.viewMemory = new ViewMemory();
view.viewInterface = new ViewInterface();
view.viewEntity = new ViewEntity();
view.viewDependency = new ViewDependency();
view.viewEventChain = new ViewEventChain();
view.viewConstraint = new ViewConstraint();
view.viewSchedule = new ViewSchedule();
view.viewAnalyse = new ViewAnalyse();
view.viewRandomTasks = new ViewRandomTasks();

// Define the controller implementations.
let controller = new Controller();
controller.controllerExportImport = new ControllerExportImport();
controller.controllerDevice = new ControllerDevice();
controller.controllerCore = new ControllerCore();
controller.controllerNetworkDelay = new ControllerNetworkDelay();
controller.controllerMemory = new ControllerMemory();
controller.controllerInterface = new ControllerInterface();
controller.controllerEntity = new ControllerEntity();
controller.controllerDependency = new ControllerDependency();
controller.controllerEventChain = new ControllerEventChain();
controller.controllerConstraint = new ControllerConstraint();
controller.controllerSchedule = new ControllerSchedule();
controller.controllerAnalyse = new ControllerAnalyse();
controller.controllerRandomTasks = new ControllerRandomTasks();

// Link the models and views to their respective controllers.
controller.controllerExportImport.view = view.viewExportImport;
controller.controllerExportImport.model = model.modelExportImport;
controller.controllerExportImport.modelDevice = model.modelDevice;
controller.controllerExportImport.modelCore = model.modelCore;
controller.controllerExportImport.modelMemory = model.modelMemory;
controller.controllerExportImport.modelNetworkDelay = model.modelNetworkDelay;
controller.controllerExportImport.modelInterface = model.modelInterface;
controller.controllerExportImport.modelEntity = model.modelEntity;
controller.controllerExportImport.modelDependency = model.modelDependency;
controller.controllerExportImport.modelEventChain = model.modelEventChain;
controller.controllerExportImport.modelConstraint = model.modelConstraint;

controller.controllerDevice.view = view.viewDevice;
controller.controllerDevice.model = model.modelDevice;
controller.controllerDevice.modelCore = model.modelCore;
controller.controllerDevice.modelNetworkDelay = model.modelNetworkDelay;

controller.controllerCore.view = view.viewCore;
controller.controllerCore.viewSchedule = view.viewSchedule;
controller.controllerCore.model = model.modelCore;
controller.controllerCore.modelEntity = model.modelEntity;
controller.controllerCore.modelDevice = model.modelDevice;

controller.controllerNetworkDelay.view = view.viewNetworkDelay;
controller.controllerNetworkDelay.model = model.modelNetworkDelay;
controller.controllerNetworkDelay.modelDevice = model.modelDevice;

controller.controllerMemory.view = view.viewMemory;
controller.controllerMemory.model = model.modelMemory;

controller.controllerInterface.view = view.viewInterface;
controller.controllerInterface.model = model.modelInterface;
controller.controllerInterface.modelDependency = model.modelDependency;
controller.controllerInterface.modelConstraint = model.modelConstraint;
controller.controllerInterface.modelEventChain = model.modelEventChain;

controller.controllerEntity.view = view.viewEntity;
controller.controllerEntity.viewSchedule = view.viewSchedule;
controller.controllerEntity.model = model.modelEntity;
controller.controllerEntity.modelCore = model.modelCore;
controller.controllerEntity.modelDevice = model.modelDevice;
controller.controllerEntity.modelDependency = model.modelDependency;
controller.controllerEntity.modelEventChain = model.modelEventChain;
controller.controllerEntity.modelNetworkDelay = model.modelNetworkDelay;
controller.controllerEntity.modelSchedule = model.modelSchedule;

controller.controllerDependency.view = view.viewDependency;
controller.controllerDependency.model = model.modelDependency;
controller.controllerDependency.modelEntity = model.modelEntity;
controller.controllerDependency.modelInterface = model.modelInterface;
controller.controllerDependency.modelEventChain = model.modelEventChain;
controller.controllerDependency.modelCore = model.modelCore;

controller.controllerSchedule.view = view.viewSchedule;
controller.controllerSchedule.model = model.modelSchedule;
controller.controllerSchedule.modelEntity = model.modelEntity;
controller.controllerSchedule.modelDevice = model.modelDevice;
controller.controllerSchedule.modelCore = model.modelCore;
controller.controllerSchedule.modelDependency = model.modelDependency;
controller.controllerSchedule.modelEventChain = model.modelEventChain;
controller.controllerSchedule.modelConstraint = model.modelConstraint;
controller.controllerSchedule.modelNetworkDelay = model.modelNetworkDelay;

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

controller.controllerRandomTasks.view = view.viewRandomTasks;
controller.controllerRandomTasks.modelEntity = model.modelEntity;
controller.controllerRandomTasks.modelDependency = model.modelDependency;

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
Plugin.Register(PluginGoalRandom);
Plugin.Register(PluginGoalEnd2EndMax);
Plugin.Register(PluginGoalEnd2EndMin);
Plugin.Register(PluginGoalIlp);
Plugin.Register(PluginGoalMinimiseCoreUsage);
Plugin.Register(PluginGoalEnd2EndMinMC);
view.viewSchedule.updateOptimiserPluginSelectors();

console.info(Plugin.ToString());

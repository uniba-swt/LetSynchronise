Helper Functions:
* Parents(DepndencyDag, Task): 
  Returns the immediate parents of a task in a task dependency directed acyclic graph.
* Schedule(Task, LET, Offset):
  Returns a periodic static schedule for a task.
* E2ePaths(TaskCommunications, E2eConstraint):
  Returns all end-to-end paths between the input and output.
* PathLatency(Path):
  Returns the total execution and communication time of a path.
* AddMetric(Entity, MetricType):
  Calculates a score for each entity based on a metric calculation and adds it 
  as an attribute to the entity. 
  A positive metric could calculate an entity's flexibility, while a negative 
  metric could calculate an entity's penalty or severity.
* MostCommonTasks(Paths):
  Returns the tasks that appear most frequently in the given paths.
* MostSlack(Tasks, MetricType):
  Returns the task with most slack based on a metric calculation. The metric
  could be relative or absolute slack.
* GoTo(Step):
  Execution of the algorithm goes to the start of mentioned step.
* CumulativeMinAge(TaskSet, TaskCommunications, Task, TaskInput):
  Returns the minimum latency for an environmental input to arrive at a task.
* CumulativeMaxAge(TaskSet, TaskCommunications, Task, TaskInput):
  Returns the maximum latency for an environmental input to arrive at a task.


Algorithm: LET Scheduling
-------------------------
Given:
* task \in TaskSet: All LET tasks in the system. Assume physical inputs/outputs are tasks.
* task = {period, wcet}: Period and estimated WCET.
* (task1, task2, signal) \in TaskCommunications: Tasks that communicate via a signal.
* (input, output, time) \in E2eConstraints: End-to-end timing constraints.

Return:
* Either, the original task set with a feasible LET schedule, 
  or nothing if some timing constraints cannot be satisfied.


// 1. Create initial schedule
// Assume that all backward dependencies have been broken.
// Tasks that only depend on physical inputs are scheduled to start at time zero,
// and immediately dependent tasks are scheduled to start immediately after.
dependencyDag = DependencyDag(TaskSet, TaskCommunications);

for each task in dependencyDag:
  parents = Parents(dependencyDag, task);
  maxOffset = max(for each parent in parents: parent.offset + parent.period);
  
  task.schedule = Schedule(task, LET = PERIOD, maxOffset);


// 2. Rank all end-to-end paths specified in the system's end-to-end timing constraints
// There could be many paths between an input and its output. 
// Split the ranking based on whether timing constraints are violated.
// Paths that exceed their timing constraint are ranked by a normalised metric.
PathsViolated = [ ];  // (Path, ActualLatency, MaxAllowedLatency, MetricScore)
PathsRelaxed = [ ];
for each constraint in E2eConstraints:
  Paths = E2ePaths(TaskCommunications, constraint);
  for each path in Paths:
    pathLatency = PathLatency(path);
    if (pathLatency > constraint.time):
      append(PathsViolated, path, pathLatency, constraint.time);
    else:
      append(PathsRelaxed, path, pathLatency, constraint.time);

AddMetric(PathsViolated, NEGATIVE);
AddMetric(PathsRelaxed, POSITIVE);


// 3. Iteratively reduce the LET or period of tasks with the greatest amount of slack
// Could be effective to start with the most common task in PathsViolated.
// Fairness could be incorporated.
while PathsViolated is non-empty:
  CriticalTasks = MostCommonTasks(PathsViolated);
  criticalTask = MostSlack(CriticalTasks, ABSOLUTE);
  criticalTask.let = criticalTask.wcet;
  GoTo(Step 1);


// 4. Rank tasks with incoherent inputs
// Need to calculate the min and max ages of a task's inputs.
// An input's age can vary if task periods are not whole multiples of each other.
TasksInputIncoherent = [ ];
for each task in TaskSet:
  inputsMinAge = infinity;
  inputsMaxAge = 0;
  for each input in task.inputs:
    inputMinAge = CumulativeMinAge(TaskSet, TaskCommunications, task, input);
    inputMaxAge = CumulativeMaxAge(TaskSet, TaskCommunications, task, input);
    
    inputsMaxAge = max(inputsMaxAge, inputMaxAge);
    inputsMinAge = min(inputsMinAge, inputMinAge);
    
  ageMaxDifference = inputsMaxAge - inputsMinAge;
  if (ageMaxDifference > tolerance):
    append(TasksInputIncoherent, task, ageMaxDifference);

AddMetric(TasksInputIncoherent, NEGATIVE);


// 5. Terminate the algorithm if TasksInputIncoherent is empty
// Return the task set with its feasible schedules.
if TasksInputIncoherent is empty:
  return TaskSet;


// 6. Correct the incoherencies
// Corrections should be made as early as possible in each path for greatest
// flexibility.
while TasksInputIncoherent is non-empty:
  // TODO
  // Add communication delays to early inputs, or increase periods of predecessor tasks
  
  if changes were made:
    GoTo(Step 1);

  if all tasks in TasksInputIncoherent have been visited:
    return Null;



- - - - - - - - - -

Alternate idea:
---------------
Resolve incoherent inputs based on common tasks in PathsViolated.
Identify frontiers in the task schedule that constrain path delays.





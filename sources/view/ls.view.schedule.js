'use strict';

class ViewSchedule {
    root = null;

    prologueField = null;
    hyperPeriodField = null;
    makespanField = null;
    
    schedulerField = null;
    executionTimingField = null;
    updateButton = null;
    
    goalField = null;
    optimiseButton = null;

    eventChainField = null;
    instanceField = null;

    schedule = null;
    dependencies = null;
    eventChainInstances = null;
    currentEventChainInstance = null;

    relatedEventChainInstances = null;
    lastClickedTaskInstance = null;

    dependencyAnalysisResults = null;
    hasDependencyAnalysisResults = false;

    scheduleTooltip = null;
    dependencyTooltip = null;
    
    svgOrigin = 0;
    panOrigin = null;

    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        // Schedule lengths
        this.prologueField = this.root.querySelector('#prologue');
        this.hyperPeriodField = this.root.querySelector('#hyperperiod');
        this.makespanField = this.root.querySelector('#makespan');

        // Scheduler
        this.schedulerField = this.root.querySelector('#view-schedule-scheduler');
        this.executionTimingField = this.root.querySelector('#view-schedule-execution-timing');
        this.updateButton = this.root.querySelector('#update');

        // Optimiser
        this.goalField = this.root.querySelector('#view-optimise-goal');
        this.optimiseButton = this.root.querySelector('#optimise');

        // Event chains
        this.eventChainField = this.root.querySelector('#view-schedule-event-chain');
        this.instanceField = this.root.querySelector('#instance');

        this.schedule = d3.select('#view-schedule');
        this.dependencies = d3.select('#view-schedule-dependencies-menu');
        this.scheduleTooltip = this.root.querySelector('#view-schedule-task-tooltip');
        this.dependencyTooltip = this.root.querySelector('#view-schedule-dependency-tooltip');
        
        // Zoom
        this.zoomField = this.root.querySelector('#zoom');
        
        // Listeners
        this.setupEventChainListener();
        this.setupInstanceInputListener();
        this.setupPanningListener();
    }
    
    get prologue() {
        return this.prologueField.value;
    }
    
    set prologue(prologue) {
        this.prologueField.value = prologue;
    }
    
    get hyperPeriod() {
        return this.hyperPeriodField.value;
    }
    
    set hyperPeriod(hyperPeriod) {
        this.hyperPeriodField.value = hyperPeriod;
    }

    get makespan() {
        return this.makespanField.value;
    }
    
    set makespan(makespan) {
        this.makespanField.value = makespan;
    }
    
    get scheduler() {
        return this.schedulerField.value;
    }
    
    set scheduler(scheduler) {
        this.schedulerField.value = scheduler;
    }
    
    get pluginScheduler() {
        return Plugin.GetPlugin(Plugin.Type.Scheduler, this.scheduler);
    }
    
    get executionTiming() {
        return this.executionTimingField.value;
    }

    set executionTiming(executionTiming) {
        this.executionTimingField.value = executionTiming;
    }

    get goal() {
        return this.goalField.value;
    }
    
    set goal(goal) {
        this.goalField.value = goal;
    }
    
    get pluginGoal() {
        return Plugin.GetPlugin(Plugin.Type.Goal, this.goal);
    }
    
    get eventChain() {
        return this.eventChainField.value;
    }
    
    set eventChain(eventChain) {
        this.eventChainField.value = eventChain;
    }
    
    get instance() {
        return this.instanceField.value;
    }
    
    set instance(instance) {
        this.instanceField.value = instance;
    }
    
    get instanceMax() {
        this.instanceField.getAttribute('max');
    }
    
    set instanceMax(max) {
        this.instanceField.setAttribute('max', max);
    }
    
    get zoomPercent() {
        return parseInt(this.zoomField.value);
    }
    
    get zoomFactor() {
        return this.zoomPercent / 100;
    }
    
    set zoomAmount(amount) {
        const oldZoomPercentage = this.zoomPercent;
        let newZoomPercent = oldZoomPercentage + amount;
        if (amount < 0) {
            newZoomPercent = Math.max(100, newZoomPercent);
        }
        this.zoomField.value = newZoomPercent;
        
        let newSvgOrigin = Math.round((this.svgOrigin * newZoomPercent + View.Width * amount / 2) / oldZoomPercentage);
        this.svgOrigin = this.boundSvgOrigin(newSvgOrigin, this.zoomFactor);
    }
    
    boundSvgOrigin(svgOrigin, zoomFactor) {
        if (0 <= svgOrigin && svgOrigin <= (zoomFactor - 1) * View.Width) {
            return svgOrigin;
        } else if (svgOrigin < 0) {
            return 0;
        } else {
            return Math.min((zoomFactor - 1) * View.Width, svgOrigin);
        }
    }
    
    get schedulingParametersRaw() {
        return {
            'makespan': this.makespan,
            'scheduler': this.pluginScheduler,
            'executionTiming': this.executionTiming,
            'scheduler': this.pluginScheduler
        };
    }
    
    get schedulingParametersClean() {
        return {
            'makespan': Math.abs(parseFloat(this.makespan)) * Utility.MsToNs,
            'scheduler': this.pluginScheduler,
            'executionTiming': this.executionTiming,
            'scheduler': this.pluginScheduler
        };
    }
    
    get optimiserParametersRaw() {
        return {
            'goal': this.pluginGoal,
        };
    }
    
    get optimiserParametersClean() {
        return {
            'goal': this.pluginGoal,
        };
    }

    set settings(settings) {
        if (settings.hasOwnProperty('makespan')) {
            this.makespan = settings.makespan;
        }
        
        // Helper function to select a dropdown item.
        const validateSetting = function(settings, settingName, selectionField, selectionSetter) {
            if (settings.hasOwnProperty(settingName)) {
                const selections = d3.select(selectionField).selectAll('option');
                const selection = selections.filter(function(d) { return this.value == settings[settingName]; });
                if (!selection.empty()) {
                    return settings[settingName];
                }
            }
            return null;
        };
        
        this.scheduler = validateSetting(settings, 'selectedScheduler', this.schedulerField);
        this.executionTiming = validateSetting(settings, 'selectedTiming', this.executionTimingField);
        this.goal = validateSetting(settings, 'selectedGoal', this.goalField);
    }
    
    get settings() {
        return {
            'makespan'          : this.makespan,
            'selectedScheduler' : this.scheduler,
            'selectedTiming'    : this.executionTiming,
            'selectedGoal'      : this.goal
        };
    }


    // -----------------------------------------------------
    // Setup listeners
    
    // Event chain has been selected for highlighting.
    setupEventChainListener() {
        this.eventChainField.addEventListener('change', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Update the instance range.
            this.instance = 0;
            this.instanceMax = this.eventChainInstances[this.eventChain] - 1;

            // Call the handler.
            this.updateEventChain(this.eventChain, this.instance);
        });
    }
    
    // Event chain instance has been selected for highlighting.
    setupInstanceInputListener() {
        this.instanceField.addEventListener('input', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Call the handler.
            this.updateEventChain(this.eventChain, this.instance);
        });
    }
    
    // Handle the panning of the schedule.
    setupPanningListener() {
        const mousemoveHandler = (event) => {            
            // Do not pan beyond the start and end of the schedule.
            const newX = this.boundSvgOrigin(this.svgOrigin + (this.panOrigin - event.clientX), this.zoomFactor);

            let svgViewBox = this.schedule.select('svg').node().viewBox.baseVal;
            svgViewBox.x = newX;
        };
        
        const removeMousemoveHandler = (event) => {
            this.schedule.node().removeEventListener('mousemove', mousemoveHandler);
            let svgViewBox = this.schedule.select('svg').node().viewBox.baseVal;
            this.svgOrigin = svgViewBox.x;
        };

        // Listen for a mouse down event to activate the panning.
        this.schedule.node().addEventListener('mousedown', event => {
            this.panOrigin = event.clientX;
            const svgViewBox = this.schedule.select('svg').node().viewBox.baseVal;
            this.svgOrigin = svgViewBox.x;

            // Attach a mouse move listener to do the panning. 
            this.schedule.node().addEventListener('mousemove', mousemoveHandler);
        });

        // Listen for a mouse up or leave event to deactivate the panning.
        this.schedule.node().addEventListener('mouseup', removeMousemoveHandler);
        this.schedule.node().addEventListener('mouseleave', removeMousemoveHandler);
    }
    
    
    // -----------------------------------------------------
    // Registration of handlers from the controller

    // Handle the "update" button.
    registerUpdateHandler(getScheduleHandler) {
        this.updateButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the inputs.
            if (this.validateSchedulingParameters(this.schedulingParametersRaw)) {
                // Ask the model to give us the current task set via a callback.
                getScheduleHandler(true);
                
                this.updateButton.classList.remove('btn-danger');
                this.updateButton.classList.add('btn-primary');
            }
        });
    }
    
    // Handle the "optimise" button.
    registerOptimiseHandler(handler) {
        this.optimiseButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the inputs.
            if (this.validateSchedulingParameters(this.schedulingParametersRaw)
                && this.validateOptimiserParameters(this.optimiserParametersRaw)) {
                // Call the handler.
                handler();

                this.updateButton.classList.remove('btn-danger');
                this.updateButton.classList.add('btn-primary');
            }
        });
    }
    
    // Handle page scrolling for zooming the schedule.
    registerZoomHandler(handler) {
        const wheelThreshold = 9;
        let totalDelta = 0;
        
        this.schedule.node().addEventListener('wheel', event => {
            if (event.shiftKey) {
                // Prevent the default behaviour of scrolling the webpage.
                event.preventDefault();
                
                const oldZoomPercentage = this.zoomPercent;
                
                totalDelta += event.deltaY;
                if (Math.abs(totalDelta) > wheelThreshold) {
                    this.zoomAmount = totalDelta;
                    totalDelta = 0;
                }
                
                if (this.zoomPercent != oldZoomPercentage) {
                    handler();
                }
            }
        });
    }
    
    
    // Validate the scheduler input fields.
    validateSchedulingParameters(schedulingParameters) {
        if (schedulingParameters.makespan == null || schedulingParameters.makespan.trim() == '' || isNaN(schedulingParameters.makespan)) {
            alert('Makespan has to be a decimal number.');
            return false;
        }
        const makespan = parseFloat(schedulingParameters.makespan);
        if (makespan <= 0) {
            alert('Makespan must be greater than zero.');
            return false;
        }
        const makespanNs = makespan * Utility.MsToNs;
        if (!Number.isSafeInteger(makespanNs)) {
            alert('Makespan is unable to be represented with nanosecond precision.');
            return false;
        }
        
        if (schedulingParameters.scheduler == null) {
            alert('Choose a task scheduling policy.');
            return false;
        }
        
        if (schedulingParameters.scheduler == null) {
            alert('Choose a task scheduling policy.');
            return false;
        }
        
        return true;
    }
    
    // Validate the optimisation input fields.
    validateOptimiserParameters(optimiserParameters) {
        if (optimiserParameters.goal == null) {
            alert('Choose an optimisation goal.');
            return false;
        }
        
        return true;
    }
    
    // Callback for the task model to notify us of changes to the task set.
    notifyChanges() {
        this.updateButton.classList.remove('btn-primary');
        this.updateButton.classList.add('btn-danger');
    }
    
    
    // Draw the entire schedule.
    async updateSchedule(promiseSchedule) {
        const schedule = await promiseSchedule;
        const taskParametersSet = await schedule['promiseAllTasks'];
        const tasksInstances = await schedule['promiseAllTasksInstances'];
        const dependenciesSet = await schedule['promiseAllDependenciesInstances'];
        const eventChainInstances = await schedule['promiseAllEventChainInstances'];
                
        if (taskParametersSet.length < 1) {
            this.prologue = 0;
            this.hyperPeriod = 0;
        } else {
            this.updatePrologue(taskParametersSet);
            this.updateHyperPeriod(taskParametersSet);
        }

        // IDEA: Pass in dependenciesSet to drawSchedule function so that I can determine whether an extra space for delay is needed between two task sets?
        
        // Draw new task schedule.
        const {svgElement, scale, taskIndices, coreIndices} = this.drawSchedule(tasksInstances);
        
        // Draw communication dependencies.
        this.hasDependencyAnalysisResults = false;
        this.dependencyAnalysisResults = { };
        this.drawDependencies(svgElement, scale, taskIndices, dependenciesSet);
        
        // Update list of event chains.
        this.updateEventChains(eventChainInstances);
    }
    
    // Compute prologue of the schedule and display it.
    updatePrologue(taskParametersSet) {
        const initialOffsets = taskParametersSet.map(taskParameters => taskParameters.initialOffset).flat();
        this.prologue = Utility.MaxOfArray(initialOffsets) / Utility.MsToNs;
    }
    
    // Compute the hyper-period of the schedule and display it.
    updateHyperPeriod(taskParametersSet) {
        const periods = taskParametersSet.map(taskParameters => taskParameters.period).flat();
        this.hyperPeriod = Utility.LeastCommonMultipleOfArray(periods) / Utility.MsToNs;
    }
    
    // Draw just the tasks and their instances.
    drawSchedule(tasksInstances) {
        // Create function to scale the data along the x-axis of fixed-length
        const scale =
        d3.scaleLinear()
          .domain([0, this.makespan * Utility.MsToNs])
          .range([0, (this.zoomFactor * View.Width) - (2 * View.SvgPadding)]);

        // Delete the existing schedule, if they exist and set up the canvas.
        this.schedule.selectAll('*').remove();
        const svgElement = this.schedule.append('svg');
        
        // Draw the task instances.
        let taskIndices = { };
        let coreIndices = { };
        const lastIndex = tasksInstances.length - 1;

        for (const [index, taskInstances] of tasksInstances.entries()) {
            this.drawTaskInstances(taskInstances, svgElement, scale, index, lastIndex);
            taskIndices[taskInstances.name] = index;

            if (tasksInstances[index + 1] && tasksInstances[index].value[0].currentCore.name != tasksInstances[index + 1].value[0].currentCore.name) {
                // console.log(tasksInstances[index].value[0].currentCore.device)
                this.drawNetworkDelay(taskInstances, svgElement, scale, index, coreIndices, lastIndex)
            }
            
            for (const instance of taskInstances.value) {
                for (const interval of instance.executionIntervals) {
                    if (coreIndices[interval.core] === undefined) {
                        coreIndices[interval.core] = Object.keys(coreIndices).length;
                    }
                }
            }
        }
        
        // Draw the system load.
        this.drawSystemLoad(tasksInstances, svgElement, scale, tasksInstances.length, coreIndices);
        
        // Set the SVG viewport.
        const svgWidth = View.Width;
        const svgHeight = 
            (tasksInstances.length + 1) * View.TaskHeight 
            + (tasksInstances.length - 2) * View.DelayHeight 
            + (Object.keys(coreIndices).length - 1) * (View.ExecutionHeight) 
            + ((tasksInstances.length - 1) * View.DelayHeight);

        svgElement
            .attr('viewBox', [this.svgOrigin, 0, svgWidth, svgHeight]);
        
        return {svgElement: svgElement, scale: scale, taskIndices: taskIndices, coreIndices: coreIndices};
    }

    drawNetworkDelay(taskInstances, svgElement, scale, index, coreIndices, lastIndex) {
        if (index == lastIndex) {
            return;
        }
    
        const tooltip = this.scheduleTooltip;   // Need to create local reference so that it can be accessed inside the mouse event handlers.

        const group =
        svgElement.append('g')
                    .attr('transform', 
                        `translate(${View.SvgPadding}, ${View.SvgPadding + ((index + 1) * View.DelayHeight)})`);

        
        // -----------------------------
        // Group for textual information
        const textInfo =
        group.append('g')
               .attr('transform', `translate(0, ${index * View.TaskHeight + View.SvgPadding})`);

        textInfo.append('text')
                  .text(`Network Delay`);

        // -----------------------------
        // Group for graphical information
        const graphInfo =
        group.append('g')
               .attr('transform', `translate(0, ${index * View.TaskHeight + (Object.keys(coreIndices).length - 1) * View.ExecutionHeight + 2.5 * View.SvgPadding})`);
        
        // Add horizontal line for the makespan
        graphInfo.append('line')
                   .attr('x1', 0)
                   .attr('x2', scale(1.1 * this.makespan * Utility.MsToNs))
                   .attr('y1', View.BarHeight + View.BarMargin)
                   .attr('y2', View.BarHeight + View.BarMargin)
                   .attr('class', 'period');

        // Add vertical line at the start of the makespan
        graphInfo.append('line')
                   .attr('x1', 0)
                   .attr('x2', 0)
                   .attr('y1', View.BarHeight + View.TickHeight + View.BarMargin)
                   .attr('y2', `0`)
                   .attr('class', 'boundary');

        const instances = taskInstances.value;
        if (instances.length == 0) {
            return;
        }

        for (const instance of instances) {
            graphInfo.append('rect')
                        .attr('x', scale(instance.letEndTime + 200000))
                        .attr('y', View.BarHeight - View.ExecutionHeight)
                        .attr('width', scale(200000))
                        .attr('height', View.ExecutionHeight)
                        .attr('class', 'time')
            
        }

    
        // Create x-axis with correct scale.
        const xAxis =
        d3.axisBottom()
          .scale(scale)
          .tickFormat(d => d / Utility.MsToNs);
        
        graphInfo.append('g')
                 .attr('transform', `translate(0, ${View.BarHeight + 2 * View.TickHeight})`)
                 .call(xAxis)
                 .call(g => g.select('.domain').remove());
        
    }
    
    
    // Draw just the instances of a given task.
    drawTaskInstances(taskInstances, svgElement, scale, index, lastIndex) {
        const tooltip = this.scheduleTooltip;   // Need to create local reference so that it can be accessed inside the mouse event handlers

        const group =
        svgElement.append('g')
                    .attr('transform', taskInstances.value[index].currentCore ? 
                        `translate(${View.SvgPadding}, ${View.SvgPadding + (index * View.DelayHeight)})` 
                        : `translate(${View.SvgPadding}, ${View.SvgPadding})`); 
        
        // -----------------------------
        // Group for textual information
        const textInfo =
        group.append('g')
               .attr('transform', `translate(0, ${index * View.TaskHeight + View.SvgPadding})`);

        // Add the task's name, inputs, and outputs
        textInfo.append('text')
                  .text(`Task: ${taskInstances.name}`);

        // -----------------------------
        // Group for graphical information
        const graphInfo =
        group.append('g')
               .attr('transform', `translate(0, ${index * View.TaskHeight + 2.5 * View.SvgPadding})`);
        
        const instances = taskInstances.value;
        if (instances.length == 0) {
            return;
        }
        
        const firstPeriodStartTime = instances[0].periodStartTime;
        const lastPeriodDuration = instances[instances.length - 1].periodEndTime - instances[instances.length - 1].periodStartTime;

        // Add horizontal line for the task's initial offset
        graphInfo.append('line')
                   .attr('x1', 0)
                   .attr('x2', scale(firstPeriodStartTime))
                   .attr('y1', View.BarHeight + View.BarMargin)
                   .attr('y2', View.BarHeight + View.BarMargin)
                   .attr('class', 'initialOffset');
        
        // Add vertical line at the start of the initial offset
        graphInfo.append('line')
                   .attr('x1', 0)
                   .attr('x2', 0)
                   .attr('y1', View.BarHeight + View.TickHeight + View.BarMargin)
                   .attr('y2', `0`)
                   .attr('class', 'boundary');
        
        // Add horizontal line for the task's periods
        graphInfo.append('line')
                   .attr('x1', scale(firstPeriodStartTime))
                   .attr('x2', scale(this.makespan * Utility.MsToNs + lastPeriodDuration))
                   .attr('y1', View.BarHeight + View.BarMargin)
                   .attr('y2', View.BarHeight + View.BarMargin)
                   .attr('class', 'period');


        for (const instance of instances) {
            // Add the task's LET duration
            graphInfo.append('rect')
                       .attr('id', `${taskInstances.name}-${instance.instance}`)
                       .attr('x', scale(instance.letStartTime))
                       .attr('width', scale(instance.letEndTime - instance.letStartTime))
                       .attr('height', View.BarHeight)
                      .on('mouseover', () => {
                        const title = `<b>${taskInstances.name}</b> instance ${instance.instance}`;
                        const periodInterval = `Period interval: [${Utility.FormatTimeString(instance.periodStartTime / Utility.MsToNs, 2)}, ${Utility.FormatTimeString(instance.periodEndTime / Utility.MsToNs, 2)}]ms`;
                        const letInterval = `LET interval: [${Utility.FormatTimeString(instance.letStartTime / Utility.MsToNs, 2)}, ${Utility.FormatTimeString(instance.letEndTime / Utility.MsToNs, 2)}]ms`;
                        const executionTime = `Total execution time: ${Utility.FormatTimeString(instance.executionTime / Utility.MsToNs, 2)}ms`;
                        tooltip.innerHTML = `${title} <br/> ${letInterval} <br/> ${periodInterval} <br/> ${executionTime}`;
                        tooltip.style.visibility = 'visible';
                      })
                      .on('mousemove', (event) => {
                        const [pointerX, pointerY] = d3.pointer(event, window);
                        tooltip.style.top = `${pointerY - 5.4 * View.BarHeight}px`;
                        tooltip.style.left = `${pointerX}px`;
                      })
                      .on('mouseout', () => {
                        tooltip.style.visibility = 'hidden';
                      })
                      .on('click', () => {
                        this.updateRelatedEventChains(taskInstances.name, instance.instance);
                      });
            
            // Add the task's execution times
            const executionIntervals = instance.executionIntervals.map(interval => Utility.Interval.FromJson(interval));
            for (const interval of executionIntervals) {

                if (index != 0 && interval.startTime > 0) {
                        graphInfo.append('rect')
                        .attr('x', scale(interval.startTime - 200000))
                        .attr('y', View.BarHeight - View.ExecutionHeight)
                        .attr('width', scale(200000))
                        .attr('height', View.ExecutionHeight)
                        .attr('class', 'receiver')
                }

                graphInfo.append('rect')
                           .attr('x', scale(interval.startTime))
                           .attr('y', View.BarHeight - View.ExecutionHeight)
                           .attr('width', scale(interval.duration))
                           .attr('height', View.ExecutionHeight)
                           .attr('class', 'time')
                         .on('mouseover', () => {
                           const core = `Core ${interval.core}`;
                           const executionInterval = `Execution interval: [${Utility.FormatTimeString(interval.startTime / Utility.MsToNs, 2)}, ${Utility.FormatTimeString((interval.startTime + interval.duration) / Utility.MsToNs, 2)}]ms`;
                           tooltip.innerHTML = `${core} <br/> ${executionInterval}`;
                           tooltip.style.visibility = 'visible';
                         })
                         .on('mousemove', (event) => {
                           const [pointerX, pointerY] = d3.pointer(event, window);
                           tooltip.style.top = `${pointerY - 3 * View.BarHeight}px`;
                           tooltip.style.left = `${pointerX}px`;
                         })
                         .on('mouseout', () => {
                           tooltip.style.visibility = 'hidden';
                         });

                if (index != lastIndex) {
                    graphInfo.append('rect')
                    .attr('x', scale(interval.startTime + interval.duration))
                    .attr('y', View.BarHeight - View.ExecutionHeight)
                    .attr('width', scale(200000))
                    .attr('height', View.ExecutionHeight)
                    .attr('class', 'sender')
                }
                
            }
            
            // Add vertical line at the start of the period
            graphInfo.append('line')
                       .attr('x1', scale(instance.periodStartTime))
                       .attr('x2', scale(instance.periodStartTime))
                       .attr('y1', View.BarHeight + View.TickHeight + View.BarMargin)
                       .attr('y2', 0)
                       .attr('class', 'boundary');
        }
        
        // Create x-axis with correct scale.
        const xAxis =
        d3.axisBottom()
          .scale(scale)
          .tickFormat(d => d / Utility.MsToNs);
        
        graphInfo.append('g')
                 .attr('transform', `translate(0, ${View.BarHeight + 2 * View.TickHeight})`)
                 .call(xAxis)
                 .call(g => g.select('.domain').remove());
    }
    
    // Draw the total system load at the bottom of the schedule.
    drawSystemLoad(tasksInstances, svgElement, scale, index, coreIndices) {
        if (index == 0) {
            return;
        }
    
        const tooltip = this.scheduleTooltip;   // Need to create local reference so that it can be accessed inside the mouse event handlers.

        const group =
        svgElement.append('g')
                    .attr('transform', `translate(${View.SvgPadding}, ${View.SvgPadding + View.DelayHeight * (index - 1)})`);
        
        // -----------------------------
        // Group for textual information
        const textInfo =
        group.append('g')
               .attr('transform', `translate(0, ${index * View.TaskHeight + View.SvgPadding})`);

        textInfo.append('text')
                  .text(`System load`);

        // -----------------------------
        // Group for graphical information
        const graphInfo =
        group.append('g')
               .attr('transform', `translate(0, ${index * View.TaskHeight + (Object.keys(coreIndices).length - 1) * View.ExecutionHeight + 2.5 * View.SvgPadding})`);
        
        // Add horizontal line for the makespan
        graphInfo.append('line')
                   .attr('x1', 0)
                   .attr('x2', scale(1.1 * this.makespan * Utility.MsToNs))
                   .attr('y1', View.BarHeight + View.BarMargin)
                   .attr('y2', View.BarHeight + View.BarMargin)
                   .attr('class', 'period');

        // Add vertical line at the start of the makespan
        graphInfo.append('line')
                   .attr('x1', 0)
                   .attr('x2', 0)
                   .attr('y1', View.BarHeight + View.TickHeight + View.BarMargin)
                   .attr('y2', `0`)
                   .attr('class', 'boundary');

        // Add the tasks' execution times
        for (const [index, taskInstances] of tasksInstances.entries()) {
            for (const instance of taskInstances.value) {
                const executionIntervals = instance.executionIntervals.map(interval => Utility.Interval.FromJson(interval));
                for (const interval of executionIntervals) {
                    const coreIndex = coreIndices[interval.core];
                    
                    graphInfo.append('rect')
                               .attr('x', scale(interval.startTime))
                               .attr('y', View.BarHeight - (coreIndex + 1) * View.ExecutionHeight)
                               .attr('width', scale(interval.duration))
                               .attr('height', View.ExecutionHeight)
                               .attr('class', 'time')
                             .on('mouseover', () => {
                               const title = `<b>${taskInstances.name}</b> instance ${instance.instance}`;
                               const core = `Core ${interval.core}`;
                               const executionInterval = `Execution interval: [${Utility.FormatTimeString(interval.startTime / Utility.MsToNs, 2)}, ${Utility.FormatTimeString((interval.startTime + interval.duration) / Utility.MsToNs, 2)}]ms`;
                               tooltip.innerHTML = `${title} <br/> ${core} <br/> ${executionInterval}`;
                               tooltip.style.visibility = 'visible';
                             })
                             .on('mousemove', (event) => {
                               const [pointerX, pointerY] = d3.pointer(event, window);
                               tooltip.style.top = `${pointerY - 4.3 * View.BarHeight}px`;
                               tooltip.style.left = `${pointerX}px`;
                             })
                             .on('mouseout', () => {
                               tooltip.style.visibility = 'hidden';
                             });
                }
            }
        }

        // Create x-axis with correct scale.
        const xAxis =
        d3.axisBottom()
          .scale(scale)
          .tickFormat(d => d / Utility.MsToNs);
        
        graphInfo.append('g')
                 .attr('transform', `translate(0, ${View.BarHeight + 2 * View.TickHeight})`)
                 .call(xAxis)
                 .call(g => g.select('.domain').remove());
    }
    
    // Draw all dependencies between the task instances.
    drawDependencies(svgElement, scale, taskIndices, dependenciesSet) {
        const dependencyNames = dependenciesSet.map(dependencies => dependencies.name);
        this.dependencies.selectAll('*').remove();
        
        const allMenuItem = 
        this.dependencies
            .append('a')
                .attr('class', 'dropdown-item active')
                .text('All');

        let svgGroups = [ ];
        for (const dependencies of dependenciesSet) {
            dependencies.value.forEach(dependency => this.drawDependency(svgElement, scale, taskIndices, dependencies.name, dependency));

            svgGroups.push(...dependencies.value.map(dependency => svgElement.select(`path#${dependencies.name}-${dependency.instance}`)));
                        
            this.dependencies
                .append('a')
                    .attr('class', 'dropdown-item active')
                    .text(dependencies.name)
                    .on('click', function() {
                        // Update style of dropdown items
                        allMenuItem.node().classList.remove('active');
                        this.classList.toggle('active');
                        
                        // Update SVG style of dependencies
                        for (const dependency of dependencies.value) {
                            const dependencyNode = svgElement.select(`path#${dependencies.name}-${dependency.instance}`).node();
                            if (this.classList.contains('active')) {
                                dependencyNode.classList.remove('dependencyHidden');
                                dependencyNode.classList.add('dependencyVisible');
                            } else {
                                dependencyNode.classList.remove('dependencyVisible');
                                dependencyNode.classList.add('dependencyHidden');
                            }
                        }
                    });
        }
        
        allMenuItem
            .on('click', function() {
                // Update style of dropdown items
                this.classList.toggle('active');
                
                this.parentNode.querySelectorAll('a').forEach(item => {
                    if (item != this) {
                        (this.classList.contains('active'))
                            ? item.classList.add('active')
                            : item.classList.remove('active');
                    }
                });
                
                // Update SVG style of dependencies
                svgGroups.forEach(svgGroup => {
                    if (this.classList.contains('active')) {
                        svgGroup.node().classList.remove('dependencyHidden');
                        svgGroup.node().classList.add('dependencyVisible');
                    } else {
                        svgGroup.node().classList.remove('dependencyVisible');
                        svgGroup.node().classList.add('dependencyHidden');
                    }
                });
            });
    }
    
    // Draw just the given dependency.
    drawDependency(svgElement, scale, taskIndices, dependencyName, dependency) {
        const yOffset = 0.5 * View.BarHeight + 2.5 * View.SvgPadding;
        const xOffset = 20;
        const tooltip = this.dependencyTooltip;   // Need to create local reference so that it can be accessed inside the mouse event handlers.
        
        const sendEvent = dependency.sendEvent;
        const receiveEvent = dependency.receiveEvent;
        let sendPortName = Utility.TaskPorts(sendEvent.task, [sendEvent.port]);
        let receivePortName = Utility.TaskPorts(receiveEvent.task, [receiveEvent.port]);
        sendEvent.timestamp = scale(sendEvent.timestamp);
        receiveEvent.timestamp = scale(receiveEvent.timestamp);
        
        const dependencyId = `${dependencyName}-${dependency.instance}`;
        this.dependencyAnalysisResults[dependencyId] = `<b>${dependencyName}</b> instance ${dependency.instance}:<br/>${sendPortName} ${View.ArrowSeparator} ${receivePortName}`
        const analysisResults = this.dependencyAnalysisResults;      // Need to create local reference so that it can be accessed inside the mouse event handlers.
        
        // Create dangling arrows if one of the tasks is Model.SystemInterfaceName
        // Need an additional y-offset
        const adjustedSendTaskHeight = (sendEvent.task == Model.SystemInterfaceName) ? -0.4 * View.TaskHeight : 0;
        const adjustedReceiveTaskHeight = (receiveEvent.task == Model.SystemInterfaceName) ? 0.4 * View.TaskHeight : 0 ;
        
        // IDEA: Use the sendEvent & receiveEvent's tasks values (just think about device's network average network delay & each task's core to determine 
        // whether they need a delay or not I think?) Maybe call network delay rendering function here?

        // Change the name and timestamp of the system event
        if (sendEvent.task == Model.SystemInterfaceName) {
            sendEvent.task = receiveEvent.task;
            sendEvent.timestamp = receiveEvent.timestamp;
            sendPortName = sendEvent.port;
        }
        
        if (receiveEvent.task == Model.SystemInterfaceName) {
            receiveEvent.task = sendEvent.task;
            receiveEvent.timestamp = sendEvent.timestamp;
            receivePortName = receiveEvent.port;
        }
        
        // Create the arrow
        const points = [
            { x: sendEvent.timestamp,                y: yOffset + taskIndices[sendEvent.task] * View.TaskHeight + adjustedSendTaskHeight },
            { x: sendEvent.timestamp + xOffset,      y: yOffset + taskIndices[sendEvent.task] * View.TaskHeight + adjustedSendTaskHeight },
            { x: receiveEvent.timestamp - xOffset,   y: yOffset + taskIndices[receiveEvent.task] * View.TaskHeight + adjustedReceiveTaskHeight },
            { x: receiveEvent.timestamp,             y: yOffset + taskIndices[receiveEvent.task] * View.TaskHeight + adjustedReceiveTaskHeight }
        ]

        let line = d3.line()
                     .x((point) => point.x)
                     .y((point) => point.y)
                     .curve(d3.curveBundle);
        
        svgElement.append('path')
                    .attr('id', dependencyId)
                    .attr('d', line(points))
                    .attr('transform', `translate(${View.SvgPadding}, ${View.SvgPadding})`)
                    .attr('class', 'dependency dependencyVisible')
                  .on('mouseover', () => {
                    tooltip.innerHTML = analysisResults[dependencyId];
                    tooltip.style.visibility = 'visible';
                  })
                  .on('mousemove', (event) => {
                    let [pointerX, pointerY] = d3.pointer(event, window);
                    tooltip.style.top = `${pointerY - View.SvgPadding}px`;
                    tooltip.style.left = `${pointerX + 2 * View.SvgPadding}px`;
                  })
                  .on('mouseout', () => {
                    tooltip.style.visibility = 'hidden';
                  });
    }
    
    // Update the drop-down menu of event chains that can be highlighted.
    updateEventChains(eventChainInstancesJson) {
        this.eventChainInstances = { };
    
        const eventChainNames = new Set();
        for (const eventChainInstanceJson of eventChainInstancesJson) {
            const eventChainInstance = ChainInstance.FromJson(eventChainInstanceJson);
            const instanceName = eventChainInstance.name;
            
            // Flatten the event chain instance information
            this.eventChainInstances[instanceName] = { };
            this.eventChainInstances[instanceName]['dependencies'] = [ ];
            this.eventChainInstances[instanceName]['taskNames'] = new Set();
            this.eventChainInstances[instanceName]['tasks'] = new Set();
            for (const dependency of eventChainInstance.generator()) {
                this.eventChainInstances[instanceName]['dependencies'].push(this.schedule.select(`path#${dependency.name}-${dependency.instance}`));
                this.eventChainInstances[instanceName]['taskNames'].add(`#${dependency.receiveEvent.task}-${dependency.receiveEvent.taskInstance}`);
                this.eventChainInstances[instanceName]['taskNames'].add(`#${dependency.sendEvent.task}-${dependency.sendEvent.taskInstance}`);
            }
            for (const taskName of this.eventChainInstances[instanceName]['taskNames']) {
                const element = this.schedule.select(`rect${taskName}`);
                if (element.node() != null) {
                    this.eventChainInstances[instanceName]['tasks'].add(element);
                }
            }

            eventChainNames.add(eventChainInstance.chainName);
            (!this.eventChainInstances.hasOwnProperty(eventChainInstance.chainName))
                ? this.eventChainInstances[eventChainInstance.chainName] = 1
                : this.eventChainInstances[eventChainInstance.chainName]++;
        }
        
        // Create list of available event chains.
        const parentElement = d3.select(this.eventChainField);
        parentElement.selectAll('*').remove();
        parentElement
            .append('option')
                .property('disabled', true)
                .property('selected', true)
                .property('hidden', true)
                .attr('value', 'null ')
                .text('Choose ...')
                
        parentElement
            .append('option')
                .attr('value', 'none ')
                .text('* None *');
        
        for (const name of eventChainNames) {
            parentElement
                .append('option')
                  .attr('value', name)
                  .text(name);
        }
        
        // Reset the instance slider.
        this.instance = 0;
        this.instanceMax = 0;
    }
    
    // Highlight the selected event chain instance in the schedule.
    updateEventChain(eventChainName, instance) {
        // Clear the SVG style of the current event chain instance.
        if (this.currentEventChainInstance != null) {
            for (const dependency of this.currentEventChainInstance.dependencies) {
                dependency.node().classList.remove('eventChainVisible');
            }
        
            for (const task of this.currentEventChainInstance.tasks) {
                task.node().classList.remove('eventChainVisible');
            }
        }
    
        // Highlight the selected event chain instance.
        if (eventChainName == "none ") {
            this.instance = 0;
            this.instanceMax = 0;
            this.currentEventChainInstance = null;
        } else {
            const instanceName = `${eventChainName}-${instance}`;
            this.currentEventChainInstance = this.eventChainInstances[instanceName];

            // Update SVG style of dependencies and tasks
            for (const dependency of this.currentEventChainInstance.dependencies) {
                dependency.node().classList.add('eventChainVisible');
            }
        
            for (const task of this.currentEventChainInstance.tasks) {
                task.node().classList.add('eventChainVisible');
            }
        }
    }
    
    // Highlight all the event chain instances in the schedule that involve the given task instance.
    updateRelatedEventChains(taskName, taskInstance) {
        const taskInstanceName = `#${taskName}-${taskInstance}`;
    
        // Clear the SVG style of the current related event chain instances.
        if (this.relatedEventChainInstances != null) {
            for (const eventChain of this.relatedEventChainInstances) {
                for (const dependency of eventChain.dependencies) {
                    dependency.node().classList.remove('relatedEventChainVisible');
                }
            
                for (const task of eventChain.tasks) {
                    task.node().classList.remove('relatedEventChainVisible');
                }
            }
        }
        
        if (this.lastClickedTaskInstance == taskInstanceName) {
            this.lastClickedTaskInstance = null;
            this.relatedEventChainInstances = null;
            return;
        }
        this.lastClickedTaskInstance = taskInstanceName;
        
        // Find the event chains that go through the given task instance.
        this.relatedEventChainInstances = [ ];
        const eventChains = Object.values(this.eventChainInstances).filter(eventChain => typeof eventChain === 'object');
        for (const eventChain of eventChains) {
            if (eventChain.taskNames.has(this.lastClickedTaskInstance)) {
                this.relatedEventChainInstances.push(eventChain);
            }
        }
        
        if (this.relatedEventChainInstances.length == 0) {
            this.relatedEventChainInstances = null;
            return;
        }
        
        // Highlight the event chain instances.
        for (const eventChain of this.relatedEventChainInstances) {
            for (const dependency of eventChain.dependencies) {
                dependency.node().classList.add('relatedEventChainVisible');
            }
        
            for (const task of eventChain.tasks) {
                task.node().classList.add('relatedEventChainVisible');
            }
        }
    }
    
    // Update the drop-down menus of scheduler and optimisation plug-ins.
    updateOptimiserPluginSelectors() {
        const pluginsGoal = Object.keys(Plugin.OfType(Plugin.Type.Goal));
        this.updateOptimiserPluginSelector(d3.select(this.goalField), pluginsGoal);
        
        const pluginsScheduler = Object.keys(Plugin.OfType(Plugin.Type.Scheduler));
        this.updateOptimiserPluginSelector(d3.select(this.schedulerField), pluginsScheduler);
    }
    
    // Update the given drop-down menu.
    updateOptimiserPluginSelector(parentElement, plugins) {
        parentElement.selectAll('*').remove();
        parentElement
            .append('option')
                .property('disabled', true)
                .property('selected', true)
                .property('hidden', true)
                .attr('value', 'null ')
                .text('Choose ...');
        
        plugins.forEach(Plugin =>
            parentElement
                .append('option')
                    .attr('value', `${Plugin}`)
                    .text(Plugin)
            );
    }
    
    // Update the tool tip of each dependency with analysis results.
    // TODO: Standardise the extraction of analysis results.
    async updateAnalyse(promise) {
        // Skip if dependency tooltips have already been updated with analysis results.
        if (this.hasDependencyAnalysisResults) {
            return;
        }
    
        this.hasDependencyAnalysisResults = true;
        const results = await promise;
        
        for (const chainName in results) {
            for (const pluginName in results[chainName]) {
                const plugin = Plugin.GetPlugin(Plugin.Type.Metric, pluginName);
                if (plugin.Output == Plugin.Output.DataAges) {
                    const metrics = results[chainName][pluginName]['metrics'];
                    for (const [dependencyName, dependencyResults] of Object.entries(metrics)) {
                        const rawResults = dependencyResults['raw'];
                        for (const [dependencyInstance, value] of Object.entries(rawResults)) {
                            const analysisResults = `<br/>${pluginName}: ${Utility.FormatTimeString(value / Utility.MsToNs, 2)}ms`;
                            const dependencyId = `${dependencyName}-${dependencyInstance}`;
                            this.dependencyAnalysisResults[dependencyId] += analysisResults;
                        }
                    }
                }
            }
        }
    }
    
    toString() {
        return 'ViewSchedule';
    }
}

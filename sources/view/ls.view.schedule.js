'use strict';

class ViewSchedule {
    root = null;

    prologueField = null;
    hyperPeriodField = null;
    makespanField = null;
    
    eventChainField = null;
    instanceField = null;
    
    eventChainInstances = null;
    currentEventChainInstance = null;

    updateButton = null;

    schedule = null;
    dependencies = null;
    scheduleTooltip = null;
    dependencyTooltip = null;

    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        // Update the static schedule
        this.prologueField = this.root.querySelector('#prologue');
        this.hyperPeriodField = this.root.querySelector('#hyperperiod');
        this.makespanField = this.root.querySelector('#makespan');
        
        this.instanceField = this.root.querySelector('#instance');

        this.updateButton = this.root.querySelector('#update');

        this.schedule = d3.select('#view-schedule');
        this.dependencies = d3.select('#view-schedule-dependencies-menu');
        this.eventChainField = this.root.querySelector('#view-schedule-event-chain');
        this.scheduleTooltip = this.root.querySelector('#view-schedule-task-tooltip');
        this.dependencyTooltip = this.root.querySelector('#view-schedule-dependency-tooltip');

        // Set the default makespan
        this.makespan = 10;
        
        // Listeners
        this.setupEventChainListener();
        this.setupInstanceInputListener();
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
    
    get schedulingParametersRaw() {
        return {
            'makespan': this.makespan
        };
    }
    
    get schedulingParametersClean() {
        return {
            'makespan': parseFloat(this.makespan)
        };
    }


    // -----------------------------------------------------
    // Setup listeners
    
    setupEventChainListener() {
        this.eventChainField.addEventListener('change', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Update the instance range.
            this.instance = 0;
            this.instanceMax = this.eventChainInstances[this.eventChain] - 1;

            // Call the handler.
            this.updateEventChain(this.eventChain, 0);
        });
    }
    
    setupInstanceInputListener() {
        this.instanceField.addEventListener('input', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Call the handler.
            this.updateEventChain(this.eventChain, this.instance);
        });
    }
    
    
    // -----------------------------------------------------
    // Registration of handlers from the controller

    registerUpdateHandler(getScheduleHandler) {
        this.updateButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Ask the model to give us the current task set via a callback.
            getScheduleHandler(this.schedulingParametersClean.makespan);
        });
    }
    
    validateSchedulingParameters(schedulingParameters) {
        if (schedulingParameters.makespan == null || isNaN(schedulingParameters.makespan)) {
            alert('Makespan has to be a decimal number.');
            return false;
        }
        const makespan = parseFloat(schedulingParameters.makespan);
        if (makespan <= 0) {
            alert('Makespan must be greater than zero');
            return false;
        }
        
        return true;
    }
    
    
    async updateSchedule(promise) {
        const taskParametersSet = await promise['promiseAllTasks'];
        const tasksInstances = await promise['promiseAllTasksInstances'];
        const dependenciesSet = await promise['promiseAllDependenciesInstances'];
        const eventChainInstances = await promise['promiseAllEventChainInstances'];
        
        if (taskParametersSet.length < 1) {
            this.prologue = 0;
            this.hyperPeriod = 0;
        } else {
            this.updatePrologue(taskParametersSet);
            this.updateHyperPeriod(taskParametersSet);
        }
        
        // Draw new task schedule.
        const {svgElement, scale, taskIndices} = this.drawSchedule(tasksInstances);
        
        // Draw communication dependencies.
        this.drawDependencies(svgElement, scale, taskIndices, dependenciesSet);
        
        // Update list of event chains.
        this.updateEventChains(eventChainInstances);
    }
    
    updatePrologue(taskParametersSet) {
        const initialOffsets = taskParametersSet.map(taskParameters => taskParameters.initialOffset).flat();
        this.prologue = Utility.MaxOfArray(initialOffsets);
    }
    
    updateHyperPeriod(taskParametersSet) {
        const periods = taskParametersSet.map(taskParameters => taskParameters.period).flat();
        this.hyperPeriod = Utility.LeastCommonMultipleOfArray(periods);
    }
    
    drawSchedule(tasksInstances) {
        // Create function to scale the data along the x-axis of fixed-length
        const scale =
        d3.scaleLinear()
          .domain([0, this.makespan])
          .range([0, View.Width - 2 * View.SvgPadding]);

        // Delete the existing task previews, if they exist and set up the canvas.
        this.schedule.selectAll('*').remove();
        const svgElement = this.schedule.append('svg');
        
        // Draw the task instances.
        let taskIndices = {};
        for (const [index, taskInstances] of tasksInstances.entries()) {
            this.drawTaskInstances(taskInstances, svgElement, scale, index);
            taskIndices[taskInstances.name] = index;
        }
        
        svgElement
          .attr('width', `${View.Width}px`)
          .attr('height', `${Object.keys(tasksInstances).length * View.TaskHeight}px`);
        
        return {svgElement: svgElement, scale: scale, taskIndices: taskIndices};
    }
    
    drawTaskInstances(taskInstances, svgElement, scale, index) {
        const tooltip = this.scheduleTooltip;   // Need to create local reference so that it can be accessed inside the mouse event handlers.

        const group =
        svgElement.append('g')
                    .attr('transform', `translate(${View.SvgPadding}, ${View.SvgPadding})`);
        
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
        const lastPeriodDuration = instances[instances.length -1].periodEndTime - instances[instances.length -1].periodStartTime;

        // Add horizontal line for the task's initial offset
        graphInfo.append('line')
                   .attr('x1', 0)
                   .attr('x2', scale(firstPeriodStartTime))
                   .attr('y1', `${View.BarHeight + View.BarMargin}`)
                   .attr('y2', `${View.BarHeight + View.BarMargin}`)
                   .attr('class', 'initialOffset');
        
        // Add vertical line at the start of the initial offset
        graphInfo.append('line')
                   .attr('x1', 0)
                   .attr('x2', 0)
                   .attr('y1', `${View.BarHeight + View.TickHeight + View.BarMargin}`)
                   .attr('y2', `0`)
                   .attr('class', 'boundary');
        
        // Add horizontal line for the task's periods
        graphInfo.append('line')
                   .attr('x1', scale(firstPeriodStartTime))
                   .attr('x2', scale(this.makespan + lastPeriodDuration))
                   .attr('y1', `${View.BarHeight + View.BarMargin}`)
                   .attr('y2', `${View.BarHeight + View.BarMargin}`)
                   .attr('class', 'period');

        for (const instance of instances) {
            // Add the task's LET duration
            graphInfo.append('rect')
                       .attr('id', `${taskInstances.name}-${instance.instance}`)
                       .attr('x', scale(instance.letStartTime))
                       .attr('width', scale(instance.letEndTime - instance.letStartTime))
                       .attr('height', View.BarHeight)
                      .on('mouseover', function() {
                        tooltip.innerHTML = `${taskInstances.name} instance ${instance.instance}`;
                        tooltip.style.visibility = 'visible';
                      })
                      .on('mousemove', (event) => {
                        let [pointerX, pointerY] = d3.pointer(event, window);
                        tooltip.style.top = `${pointerY - 2 * View.BarHeight}px`;
                        tooltip.style.left = `${pointerX}px`;
                      })
                      .on('mouseout', function() {
                        tooltip.style.visibility = 'hidden';
                      });
            
            // Add vertical line at the start of the period
            graphInfo.append('line')
                     .attr('x1', scale(instance.periodStartTime))
                     .attr('x2', scale(instance.periodStartTime))
                     .attr('y1', `${View.BarHeight + View.TickHeight + View.BarMargin}`)
                     .attr('y2', `0`)
                     .attr('class', 'boundary');
        }
        
        // Create x-axis with correct scale.
        const xAxis = d3.axisBottom().scale(scale);
        
        graphInfo.append('g')
                 .attr('transform', `translate(0, ${View.BarHeight + 2 * View.TickHeight})`)
                 .call(xAxis)
                 .call(g => g.select('.domain').remove());
    }
    
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

            svgGroups.push(...dependencies.value.map(dependency => d3.select(`#${dependencies.name}-${dependency.instance}`)));
                        
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
                            const dependencyNode = d3.select(`#${dependencies.name}-${dependency.instance}`).node();
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
        
    drawDependency(svgElement, scale, taskIndices, dependencyName, dependency) {
        const yOffset = 0.5 * View.BarHeight + 2.5 * View.SvgPadding;
        const xOffset = 20;
        const tooltip = this.dependencyTooltip;   // Need to create local reference so that it can be accessed inside the mouse event handlers.
        
        const dependencyId = `${dependencyName}-${dependency.instance}`;
        const sendEvent = dependency.sendEvent;
        const receiveEvent = dependency.receiveEvent;
        let sendPortName = Utility.TaskPorts(sendEvent.task, [sendEvent.port]);
        let receivePortName = Utility.TaskPorts(receiveEvent.task, [receiveEvent.port]);
        sendEvent.timestamp = scale(sendEvent.timestamp);
        receiveEvent.timestamp = scale(receiveEvent.timestamp);
        
        // Create dangling arrows if one of the tasks is Model.SystemInterfaceName
        // Need an additional y-offset
        const adjustedSendTaskHeight = (sendEvent.task == Model.SystemInterfaceName) ? -0.4 * View.TaskHeight : 0;
        const adjustedReceiveTaskHeight = (receiveEvent.task == Model.SystemInterfaceName) ? 0.4 * View.TaskHeight : 0 ;
        
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
                  .on('mouseover', function() {
                    tooltip.innerHTML = `${dependencyName} instance ${dependency.instance}:<br/>${sendPortName} &rarr; ${receivePortName}`;
                    tooltip.style.visibility = 'visible';
                  })
                  .on('mousemove', (event) => {
                    let [pointerX, pointerY] = d3.pointer(event, window);
                    tooltip.style.top = `${pointerY - View.SvgPadding}px`;
                    tooltip.style.left = `${pointerX + 2 * View.SvgPadding}px`;
                  })
                  .on('mouseout', function() {
                    tooltip.style.visibility = 'hidden';
                  });
    }
    
    updateEventChains(eventChainInstancesJson) {
        this.eventChainInstances = { };
    
        const eventChainNames = new Set();
        for (const eventChainInstanceJson of eventChainInstancesJson) {
            const eventChainInstance = ChainInstance.FromJson(eventChainInstanceJson);
            const instanceName = eventChainInstance.name;
            
            // Flatten the event chain instance information
            this.eventChainInstances[instanceName] = { };
            this.eventChainInstances[instanceName]['dependencies'] = [ ];
            this.eventChainInstances[instanceName]['tasks'] = new Set();
            for (const dependency of eventChainInstance.generator()) {
                this.eventChainInstances[instanceName]['dependencies'].push(d3.select(`#${dependency.name}-${dependency.instance}`));
                this.eventChainInstances[instanceName]['tasks'].add(d3.select(`#${dependency.receiveEvent.task}-${dependency.receiveEvent.taskInstance}`));
                this.eventChainInstances[instanceName]['tasks'].add(d3.select(`#${dependency.sendEvent.task}-${dependency.sendEvent.taskInstance}`));
            }

            eventChainNames.add(eventChainInstance.chainName);
            (!this.eventChainInstances.hasOwnProperty(eventChainInstance.chainName))
                ? this.eventChainInstances[eventChainInstance.chainName] = 1
                : this.eventChainInstances[eventChainInstance.chainName]++;
        }
        
        // Create list of available event chains
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
    }
    
    updateEventChain(eventChainName, instance) {
        // Clear the SVG style of the current event chain instance.
        if (this.currentEventChainInstance != null) {
            for (const dependency of this.currentEventChainInstance.dependencies) {
                dependency.node().classList.remove('eventChainVisible');
            }
        
            for (const task of this.currentEventChainInstance.tasks) {
                task.style('fill', 'var(--bs-gray-500)');
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
                task.style('fill', 'var(--bs-blue)');
            }
        }
    }
    
    toString() {
        return 'ViewSchedule';
    }
}

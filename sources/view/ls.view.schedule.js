'use strict';

class ViewSchedule {
    root = null;

    prologueField = null;
    hyperPeriodField = null;
    makespanField = null;

    updateButton = null;

    schedule = null;
    dependencies = null;
    eventChains = null;
    scheduleTooltip = null;
    dependencyTooltip = null;

    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        // Update the static schedule
        this.prologueField = this.root.querySelector('#prologue');
        this.hyperPeriodField = this.root.querySelector('#hyperperiod');
        this.makespanField = this.root.querySelector('#makespan');

        this.updateButton = this.root.querySelector('#update');

        this.schedule = d3.select('#view-schedule');
        this.dependencies = d3.select('#view-schedule-dependencies-menu');
        this.eventChains = d3.select('#view-schedule-event-chains-menu');
        this.scheduleTooltip = this.root.querySelector('#view-schedule-task-tooltip');
        this.dependencyTooltip = this.root.querySelector('#view-schedule-dependency-tooltip');

        // Set the default makespan
        this.makespan = 10;
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
        
        // Draw event chains.
        this.drawEventChains(eventChainInstances);
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
                   .attr('y2', `${View.BarHeight - View.TickHeight}`)
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
                          d3.select(this)
                            .transition()
                            .ease(d3.easeLinear)
                            .style('fill', 'var(--bs-blue)');
                          tooltip.innerHTML = `${taskInstances.name} instance ${instance.instance}`;
                          tooltip.style.visibility = 'visible';
                      })
                      .on('mousemove', (event) => {
                          let [pointerX, pointerY] = d3.pointer(event, window);
                          tooltip.style.top = `${pointerY - 2 * View.BarHeight}px`;
                          tooltip.style.left = `${pointerX}px`;
                      })
                      .on('mouseout', function() {
                          d3.select(this)
                            .transition()
                            .ease(d3.easeLinear)
                            .style('fill', 'var(--bs-gray)');
                          tooltip.style.visibility = 'hidden';
                      });
            
            // Add vertical line at the start of the period
            graphInfo.append('line')
                     .attr('x1', scale(instance.periodStartTime))
                     .attr('x2', scale(instance.periodStartTime))
                     .attr('y1', `${View.BarHeight + View.TickHeight + View.BarMargin}`)
                     .attr('y2', `${View.BarHeight - View.TickHeight}`)
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
							d3.select(`#${dependencies.name}-${dependency.instance}`)
							  .node().style.visibility = this.classList.contains('active') ? 'visible' : 'hidden';
						}
                    });
        }
        
        allMenuItem
            .on('click', function() {
                // Update style of dropdown items
                this.classList.toggle('active');
                
                this.parentNode.querySelectorAll('a').forEach(item => {
                    if (item != this) {
                        if (this.classList.contains('active')) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    }
                    
                    svgGroups.forEach(svgGroup => {
                        svgGroup.node().style.visibility = this.classList.contains('active') ? 'visible' : 'hidden';
                    });
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
        
        const group =
        svgElement.append('g')
                    .attr('class', 'dependency')
                    .attr('transform', `translate(${View.SvgPadding}, ${View.SvgPadding})`);
        
        group.append('path')
               .attr('id', dependencyId)
               .attr('d', line(points))
               .attr('marker-end', 'url(#arrowRed)')
             .on('mouseover', function() {
               d3.select(this)
                 .transition()
                 .ease(d3.easeLinear)
                 .attr('marker-end', 'url(#arrowOrange)')
                 .attr('stroke', 'var(--bs-orange)');
               tooltip.innerHTML = `${dependencyName} instance ${dependency.instance}:<br/>${sendPortName} &rarr; ${receivePortName}`;
               tooltip.style.visibility = 'visible';
             })
             .on('mousemove', (event) => {
               let [pointerX, pointerY] = d3.pointer(event, window);
               tooltip.style.top = `${pointerY - View.SvgPadding}px`;
               tooltip.style.left = `${pointerX + 2 * View.SvgPadding}px`;
             })
             .on('mouseout', function() {
               d3.select(this)
                 .transition()
                 .ease(d3.easeLinear)
                 .attr('marker-end', 'url(#arrowRed)')
                 .attr('stroke', 'var(--bs-red)');
               tooltip.style.visibility = 'hidden';
             });
    }
    
    drawEventChains(eventChainInstances) {
        this.eventChains.selectAll('*').remove();
        
        const allMenuItem = 
        this.eventChains
            .append('a')
                .attr('class', 'dropdown-item')
                .text('All');
                
        let svgGroups = [ ];
    
        for (const eventChainInstanceJson of eventChainInstances) {
            // Flatten the event chain instance information
            const eventChainInstance = ChainInstance.FromJson(eventChainInstanceJson);
            const name = eventChainInstance.name;
            
            let dependencies = [ ];
            let tasks = new Set();
            for (const dependency of eventChainInstance.generator()) {
                dependencies.push(`${dependency.name}-${dependency.instance}`);
                tasks.add(`${dependency.receiveEvent.task}-${dependency.receiveEvent.taskInstance}`)
                tasks.add(`${dependency.sendEvent.task}-${dependency.sendEvent.taskInstance}`)
            }
            
			svgGroups.push(...dependencies.map(dependency => d3.select(`#${dependency}`)));

            this.eventChains
                .append('a')
                    .attr('class', 'dropdown-item')
                    .text(name)
                    .on('click', function() {
                        // Update style of dropdown items
                        allMenuItem.node().classList.remove('active');
                        this.classList.toggle('active');
                                                
                        const strokeColour = this.classList.contains('active') ? 'var(--bs-blue)' : 'var(--bs-red)';
                        const strokeWidth = this.classList.contains('active') ? 5 : 2;
						const fillColour = this.classList.contains('active') ? 'var(--bs-blue)' : 'var(--bs-gray)';
						const markerEnd = this.classList.contains('active') ? 'arrowBlue' : 'arrowRed'
                        
                        // Update SVG style of dependencies and tasks
						for (const dependency of dependencies) {
							d3.select(`#${dependency}`)
							  .transition()
							  .ease(d3.easeLinear)
							  .attr('marker-end', `url(#${markerEnd})`)
							  .attr('stroke', strokeColour)
							  .attr('stroke-width', strokeWidth)
							  .node().style.visibility = this.classList.contains('active') ? 'visible' : 'hidden';
						}
						
						for (const task of tasks) {
							d3.select(`#${task}`)
							  .transition()
							  .ease(d3.easeLinear)
							  .style('fill', fillColour);
						}
                    });
        }

        allMenuItem
            .on('click', function() {
                // Update style of dropdown items
                this.classList.toggle('active');
                
                this.parentNode.querySelectorAll('a').forEach(item => {
                    if (item != this) {
                        if (this.classList.contains('active')) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    }
                    
                    svgGroups.forEach(svgGroup => {
                        svgGroup.node().style.visibility = this.classList.contains('active') ? 'visible' : 'hidden';
                    });
                });
            });
    }
    
    toString() {
        return 'ViewSchedule';
    }
}

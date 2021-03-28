'use strict';

class ViewSchedule {
    root = null;
    modelDependency = null;

    prologueField = null;
    hyperPeriodField = null;
    makespanField = null;

    updateButton = null;

    schedule = null;
    scheduleTooltip = null;
    dataflowTooltip = null;

    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        // Update the static schedule
        this.prologueField = this.root.querySelector('#prologue');
        this.hyperPeriodField = this.root.querySelector('#hyperperiod');
        this.makespanField = this.root.querySelector('#makespan');

        this.updateButton = this.root.querySelector('#update');

        this.schedule = d3.select('#view-schedule');
        this.scheduleTooltip = this.root.querySelector('#view-schedule-tooltip');
        this.dataflowTooltip = this.root.querySelector('#view-dataflow-tooltip');

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
    
    
    // -----------------------------------------------------
    // Registration of handlers from the controller

    registerUpdateHandler(getScheduleHandler) {
        this.updateButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Ask the model to give us the current task set via a callback.
            getScheduleHandler(this.updateSchedule.bind(this), this.makespan);
        });
    }
    
    
    // -----------------------------------------------------
    // Registration of model dependency
    
    registerModelDependency(modelDependency) {
        this.modelDependency = modelDependency;
    }
    
    
    updateSchedule(taskParametersSet) {
        this.updatePrologue(taskParametersSet);
        this.updateHyperPeriod(taskParametersSet);
        
        // Draw new schedule.
        const {svgElement, scale, taskIndices} = this.drawSchedule(taskParametersSet);
        
        // Draw communication dependencies.
        // TODO: Get communication dependencies.
        const dataflows = this.modelDependency.getAllDependencyInstances();
        this.drawDataflows(svgElement, scale, taskIndices, dataflows);
    }
    
    updatePrologue(taskParametersSet) {
        const initialOffsets = taskParametersSet.map(taskParameters => taskParameters.initialOffset).flat();
        this.prologue = Utility.MaxOfArray(initialOffsets);
    }
    
    updateHyperPeriod(taskParametersSet) {
        const periods = taskParametersSet.map(taskParameters => taskParameters.period).flat();
        this.hyperPeriod = Utility.LeastCommonMultipleOfArray(periods);
    }
    
    drawSchedule(taskParametersSet) {
		// Create function to scale the data along the x-axis of fixed-length
		const scale =
		d3.scaleLinear()
		  .domain([0, this.makespan])
		  .range([0, View.Width - 2 * View.SvgPadding]);

        // Delete the existing task previews, if they exist
        // and set up the canvas.
        this.schedule.selectAll('*').remove();
		const svgElement = this.schedule.append('svg');
        
        // Draw the task instances.
        var index = 0;
        var taskIndices = {};
        for (const taskParameters of taskParametersSet) {
            this.drawTaskInstances(taskParameters, svgElement, scale, index);
            taskIndices[taskParameters.name] = index;
            index++;
        }
        
        svgElement
          .attr('width', `${View.Width}px`)
          .attr('height', `${index * View.TaskHeight}px`);
        
        return {svgElement: svgElement, scale: scale, taskIndices: taskIndices};
    }
    
    drawTaskInstances(taskParameters, svgElement, scale, index) {
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
                  .text(`Task: ${taskParameters.name}`);

        // -----------------------------
        // Group for graphical information
        const graphInfo =
        group.append('g')
               .attr('transform', `translate(0, ${index * View.TaskHeight + 2.5 * View.SvgPadding})`);
        
        let periodStart = taskParameters.initialOffset;

        // Add horizontal line for the task's initial offset
        graphInfo.append('line')
                   .attr('x1', 0)
                   .attr('x2', scale(periodStart))
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
                   .attr('x1', scale(periodStart))
                   .attr('x2', scale(this.makespan + taskParameters.period))
                   .attr('y1', `${View.BarHeight + View.BarMargin}`)
                   .attr('y2', `${View.BarHeight + View.BarMargin}`)
                   .attr('class', 'period');

        // Replace with pre-computed values from ls.model.schedule
        for (var instance = 1; periodStart < this.makespan; periodStart += taskParameters.period, instance++) {
            // Add the task's LET duration
            const instanceCopy = instance;
            graphInfo.append('rect')
                       .attr('x', scale(periodStart + taskParameters.activationOffset))
                       .attr('width', scale(taskParameters.duration))
                       .attr('height', View.BarHeight)
                      .on('mouseover', function() {
                          d3.select(this)
                            .transition()
                            .ease(d3.easeLinear)
                            .style('fill', 'var(--blue)');
                          tooltip.innerHTML = `${taskParameters.name} instance ${instanceCopy}`;
                          tooltip.style.visibility = 'visible';
                      })
                      .on('mousemove', function() {
                          tooltip.style.top = `${d3.event.pageY - 2 * View.BarHeight}px`;
                          tooltip.style.left = `${d3.event.pageX}px`;
                      })
                      .on('mouseout', function() {
                          d3.select(this)
                            .transition()
                            .ease(d3.easeLinear)
                            .style('fill', 'var(--gray)');
                          tooltip.style.visibility = 'hidden';
                      });
            
            // Add vertical line at the start of the period
            graphInfo.append('line')
                     .attr('x1', scale(periodStart))
                     .attr('x2', scale(periodStart))
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
    
    drawDataflows(svgElement, scale, taskIndices, dataflows) {
        // Define arrow head of a dataflow line
        const svgDefs =
        svgElement.append('defs')
                  .append('marker')
                    .attr('id', 'arrow')
                    .attr('viewBox', '0 -5 10 10')
                    .attr('refX', 5)
                    .attr('refY', 0)
                    .attr('markerWidth', 4)
                    .attr('markerHeight', 4)
                    .attr('orient', 'auto')
				  .append('path')
					.attr('d', 'M0, -5L10, 0L0, 5')
					.attr('class', 'arrowHead');
        
        for (const dataflow of dataflows) {
            this.drawDataflow(svgElement, scale, taskIndices, dataflow);
        }
    }
    
    drawDataflow(svgElement, scale, taskIndices, dataflow) {
        const yOffset = 0.5 * View.BarHeight + 2.5 * View.SvgPadding;
        const xOffset = 20;
        
        const tooltip = this.dataflowTooltip;   // Need to create local reference so that it can be accessed inside the mouse event handlers.
        
        const dependencyName = dataflow.name;
        
        const sourceTask = Utility.GetTask(dataflow.sendEvent.port);
        const sourceTimestamp = scale(dataflow.sendEvent.timestamp);
        
        const destinationTask = Utility.GetTask(dataflow.receiveEvent.port);
        const destinationTimestamp = scale(dataflow.receiveEvent.timestamp);

        const points = [
            { x: sourceTimestamp,                y: taskIndices[sourceTask] },
            { x: sourceTimestamp + xOffset,      y: taskIndices[sourceTask] },
            { x: destinationTimestamp - xOffset, y: taskIndices[destinationTask] },
            { x: destinationTimestamp,           y: taskIndices[destinationTask] }
        ]

        var line = d3.line()
                     .x((point) => point.x)
                     .y((point) => yOffset + View.TaskHeight * point.y)
                     .curve(d3.curveBundle);
        
        const group =
        svgElement.append('g')
                    .attr('class', `dependency view-dependency-${dependencyName}`)
                    .attr('transform', `translate(${View.SvgPadding}, ${View.SvgPadding})`);
        
        group.append('path')
               .attr('d', line(points))
               .attr('marker-end', 'url(#arrow)')
             .on('mouseover', function() {
               d3.select(this)
                 .transition()
                 .ease(d3.easeLinear)
                 .style('stroke', 'var(--orange)');
               tooltip.innerHTML = `${dependencyName}:<br/>${dataflow.sendEvent.port} &rarr; ${dataflow.receiveEvent.port}`;
               tooltip.style.visibility = 'visible';
             })
             .on('mousemove', function() {
               tooltip.style.top = `${d3.event.pageY - View.SvgPadding}px`;
               tooltip.style.left = `${d3.event.pageX + 2 * View.SvgPadding}px`;
             })
             .on('mouseout', function() {
               d3.select(this)
                 .transition()
                 .ease(d3.easeLinear)
                 .style('stroke', 'var(--red)');
               tooltip.style.visibility = 'hidden';
             });
    }
    
    toString() {
        return 'ViewSchedule';
    }
}

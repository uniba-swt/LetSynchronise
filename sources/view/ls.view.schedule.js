'use strict';

class ViewSchedule {
    root = null;
        
    prologueField = null;
    hyperPeriodField = null;
    makespanField = null;

    updateButton = null;

    schedule = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        // Update the static schedule
        this.prologueField = this.root.querySelector('#prologue');
        this.hyperPeriodField = this.root.querySelector('#hyperperiod');
        this.makespanField = this.root.querySelector('#makespan');

        this.updateButton = this.root.querySelector('#update');

        this.schedule = d3.select('#view-schedule');
        
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
    
    get viewableWidth() {
        return window.innerWidth - 40;
    }
    
    // -----------------------------------------------------
    // Setup listeners
    
    registerUpdateHandler(getAllTasksHandler) {
        this.updateButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Ask the model to give us the current task set via a callback.
            getAllTasksHandler(this.updateSchedule.bind(this));
        });
    }
    
    updateSchedule(taskParametersSet) {
        this.updatePrologue(taskParametersSet);
        this.updateHyperPeriod(taskParametersSet);
        this.updateTasks(taskParametersSet);
    }
    
    updatePrologue(taskParametersSet) {
        const initialOffsets = taskParametersSet.map(taskParameters => taskParameters.initialOffset).flat();
        this.prologue = Utility.MaxOfArray(initialOffsets);
    }
    
    updateHyperPeriod(taskParametersSet) {
        const periods = taskParametersSet.map(taskParameters => taskParameters.period).flat();
        this.hyperPeriod = Utility.LeastCommonMultipleOfArray(periods);
    }

    updateTasks(taskParametersSet) {
        // Delete the existing task previews, if they exist
        this.schedule.selectAll('*').remove();
        
        for (const taskParameters of taskParametersSet) {
            const taskListItem = this.schedule.append('li');
            this.draw(taskListItem, taskParameters);
        }
    }
    
    draw(parentElement, taskParameters, makespan) {
        const barHeight = 20;
        const barMargin = 1;
        const tickHeight = 6;
        const taskHeight = 100;
        const svgPadding = 10;
        
		// Create function to scale the data along the x-axis of fixed-length
		const scale =
		d3.scaleLinear()
		  .domain([0, this.makespan])
		  .range([0, this.viewableWidth - 2*svgPadding]);

		// Create x-axis with correct scale. Will be added to the chart later
		const x_axis =
		d3.axisBottom()
		  .scale(scale);

        // Set up the canvas
		const group =
        parentElement
          .append('svg')
            .attr('width', `${this.viewableWidth}px`)
            .attr('height', `${taskHeight}px`)
          .append('g')
            .attr('transform', `translate(${svgPadding}, ${svgPadding})`);
        
        // -----------------------------
        // Group for textual information
        const textInfo =
        group.append('g')
             .attr('transform', `translate(0, ${svgPadding})`);

        // Add the task's name, inputs, and outputs
        textInfo.append('text')
                .text(`Task: ${taskParameters.name}`);

        // -----------------------------
        // Group for graphical information
        const graphInfo =
        group.append('g')
             .attr('transform', `translate(0, ${3*svgPadding})`);
        
        let periodStart = taskParameters.initialOffset;

        // Add horizontal line to indicate the task's initial offset
        graphInfo.append('line')
                 .attr('x1', 0)
                 .attr('x2', scale(periodStart))
                 .attr('y1', `${barHeight + barMargin}`)
                 .attr('y2', `${barHeight + barMargin}`)
                 .attr('class', 'initialOffset');
        // Add vertical line at the start of the initial offset
        graphInfo.append('line')
                 .attr('x1', 0)
                 .attr('x2', 0)
                 .attr('y1', `${barHeight + tickHeight}`)
                 .attr('y2', `${barHeight - tickHeight}`)
                 .attr('class', 'boundary');
        
        // Add horizontal line to indicate the task's period
        graphInfo.append('line')
                 .attr('x1', scale(periodStart))
                 .attr('x2', scale(this.makespan))
                 .attr('y1', `${barHeight + barMargin}`)
                 .attr('y2', `${barHeight + barMargin}`)
                 .attr('class', 'period');

        // Replace with pre-computed values from ls.model.schedule
        for (null ; periodStart < this.makespan; periodStart += taskParameters.period) {
            // Add the task's LET duration
            graphInfo.append('rect')
                     .attr('x', scale(periodStart + taskParameters.activationOffset))
                     .attr('width', scale(taskParameters.duration))
                     .attr('height', barHeight);

            // Add vertical line at the start of the period
            graphInfo.append('line')
                     .attr('x1', scale(periodStart))
                     .attr('x2', scale(periodStart))
                     .attr('y1', `${barHeight + tickHeight}`)
                     .attr('y2', `${barHeight - tickHeight}`)
                     .attr('class', 'boundary');
        }
            
        graphInfo.append('g')
                 .attr('transform', `translate(0, ${barHeight + 2*tickHeight})`)
                 .call(x_axis)
                 .call(g => g.select('.domain').remove());
	}
    
    taskPorts(taskName, taskPorts) {
        return taskPorts.map(port => `${taskName}.${port}`);
    }
    
    formatTaskPorts(taskName, taskPorts) {
        return this.taskPorts(taskName, taskPorts).join(', ');
    }
    
    toString() {
        return "ViewSchedule";
    }
}

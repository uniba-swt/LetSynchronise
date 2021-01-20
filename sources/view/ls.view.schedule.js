'use strict';

class ViewSchedule {
    root = null;
    
    updateButton = null;
    
    schedule = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-analyse');
        
        // Update the static schedule
        this.updateButton = this.root.querySelector('#update');
        
        this.schedule = d3.select('#view-schedule');
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
        this.updateTasks(taskParametersSet);
    }

    draw(parentElement, taskParameters) {
		// Create function to scale the data along the x-axis of fixed-length
		const scale =
		d3.scaleLinear()
		  .domain([0, taskParameters.initialOffset + taskParameters.period])
		  .range([0, 600]);

		// Create x-axis with correct scale. Will be added to the chart later
		const x_axis =
		d3.axisBottom()
		  .scale(scale);

		const barHeight = 20;
		const barMargin = 2;

        // Set up the canvas
		const bar =
        parentElement
		    .append('svg')
		    .append('g')
		      .attr('transform', `translate(10, 10)`);

        // Create a new SVG group for the task and populate with its data
		const group =
		bar.selectAll('g')
		   .data([taskParameters])
		   .enter()
        
        // -----------------------------
        // Group for textual information
        const textInfo =
        group.append('g')
                .attr('transform', `translate(0, 10)`);
        
        // Add the task's name, inputs, and outputs
        textInfo.append('text')
                .attr('dy', '0em')
                .text(taskParameters => `Task: ${taskParameters.name}`);
        textInfo.append('text')
                .attr('dy', '1.3em')
                .text(taskParameters => `Inputs: ${this.formatTaskPorts(taskParameters.name, taskParameters.inputs)}`);
        textInfo.append('text')
                .attr('dy', '2.6em')
                .text(taskParameters => `Outputs: ${this.formatTaskPorts(taskParameters.name, taskParameters.outputs)}`);

        // -----------------------------
        // Group for graphical information
        const graphInfo =
        group.append('g')
             .attr('transform', `translate(0, 60)`);
        
        // Add the task's LET duration
        graphInfo.append('rect')
                 .attr('x', d => scale(d.initialOffset + d.activationOffset))
                 .attr('width', d => scale(d.duration))
                 .attr('height', barHeight);
		
		// Add horizontal line to indicate the task's initial offset
        graphInfo.append('line')
                 .attr('x1', 0)
                 .attr('x2', d =>scale(d.initialOffset))
                 .attr('y1', `${barHeight + barMargin}`)
                 .attr('y2', `${barHeight + barMargin}`)
                 .attr('class', 'initialOffset');

        // Add horizontal line to indicate the task's period
        graphInfo.append('line')
                 .attr('x1', d =>scale(d.initialOffset))
                 .attr('x2', d =>scale(d.initialOffset + d.period))
                 .attr('y1', `${barHeight + barMargin}`)
                 .attr('y2', `${barHeight + barMargin}`)
                 .attr('class', 'period');

        // Add vertical lines around the initial offset and period
        graphInfo.append('line')
                 .attr('x1', 0)
                 .attr('x2', 0)
                 .attr('y1', `${barHeight + barMargin + 3*barMargin}`)
                 .attr('y2', `${barHeight + barMargin - 3*barMargin}`)
                 .attr('class', 'boundary');
        graphInfo.append('line')
                 .attr('x1', d =>scale(d.initialOffset))
                 .attr('x2', d =>scale(d.initialOffset))
                 .attr('y1', `${barHeight + barMargin + 3*barMargin}`)
                 .attr('y2', `${barHeight + barMargin - 3*barMargin}`)
                 .attr('class', 'boundary');
        graphInfo.append('line')
                 .attr('x1', d =>scale(d.initialOffset + d.period))
                 .attr('x2', d =>scale(d.initialOffset + d.period))
                 .attr('y1', `${barHeight + barMargin + 3*barMargin}`)
                 .attr('y2', `${barHeight + barMargin - 3*barMargin}`)
                 .attr('class', 'boundary');
		     
        graphInfo.append('g')
                 .attr('transform', `translate(0, ${barHeight + 7*barMargin})`)
                 .call(x_axis)
                 .call(g => g.select('.domain').remove());
	}
    
    updateTasks(taskParametersSet) {
        // Delete the existing task previews, if they exist
        this.schedule.selectAll('*').remove();
        
        for (const taskParameters of taskParametersSet) {
            const taskListItem = this.schedule.append('li');
            this.draw(taskListItem, taskParameters);
        }
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

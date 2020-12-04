'use strict';

class ViewTask {
    root = null;
    
    nameField = null;
    initialOffsetField = null;
    activationOffsetField = null;
    durationField = null;
    periodField = null;
    inputsField = null;
    outputsField = null;
    
    previewButton = null;
    submitButton = null;
    
    taskSet = null;
    
    constructor() {
        this.root = document.querySelector('#view-task-define');
        
        this.nameField = this.root.querySelector('#name');
        this.initialOffsetField = this.root.querySelector('#initial-offset');
        this.activationOffsetField = this.root.querySelector('#activation-offset');
        this.durationField = this.root.querySelector('#duration');
        this.periodField = this.root.querySelector('#period');
        this.inputsField = this.root.querySelector('#inputs');
        this.outputsField = this.root.querySelector('#outputs');
        
        this.previewButton = this.root.querySelector('#preview');
        this.submitButton = this.root.querySelector('#submit');
        
        this.taskPreview = d3.select('#view-task-preview');
        this.taskSet = d3.select('#view-task-set');
        
        this.setupPreviewButtonListener();
    }
    
    get name() {
        return this.nameField.value;
    }
    
    get initialOffset() {
    	return this.initialOffsetField.value;
    }
    
    get activationOffset() {
    	return this.activationOffsetField.value;
    }
    
    get duration() {
    	return this.durationField.value;
    }
    
    get period() {
    	return this.periodField.value;
    }
    
    get inputs() {
    	return this.inputsField.value;
    }
    
    get outputs() {
    	return this.outputsField.value;
    }
    
    // -----------------------------------------------------
    // Setup listeners
    
    setupPreviewButtonListener() {
        this.previewButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Package all the task paramters into an object.
            // Parameters are strings.
            let taskParametersRaw = {
            	'name': this.name, 
            	'initialOffset': this.initialOffset,
            	'activationOffset': this.activationOffset,
            	'duration': this.duration,
            	'period': this.period,
            	'inputs': this.inputs,
            	'outputs': this.outputs
            };
			
            // Validate the inputs.            
            if (this.validateTaskParameters(taskParametersRaw)) {
            	// Package all the task parameters into an object.
            	// Parameters are converted into proper types.
				let taskParameters = {
					'name': this.name, 
					'initialOffset': parseFloat(this.initialOffset),
					'activationOffset': parseFloat(this.activationOffset),
					'duration': parseFloat(this.duration),
					'period': parseFloat(this.period),
					'inputs': this.inputs.split(',').map(item => item.trim()).filter(Boolean),
					'outputs': this.outputs.split(',').map(item => item.trim()).filter(Boolean)
				};
            
                // Call the handler.
            	this.updatePreview(taskParameters);
            }
        });
    }
    
    // -----------------------------------------------------
    // Registration of handlers from the controller

    registerSubmitHandler(handler) {
        this.submitButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Package all the task paramters into an object.
            // Parameters are strings.
            let taskParametersRaw = {
            	'name': this.name, 
            	'initialOffset': this.initialOffset,
            	'activationOffset': this.activationOffset,
            	'duration': this.duration,
            	'period': this.period,
            	'inputs': this.inputs,
            	'outputs': this.outputs
            };
			
            // Validate the inputs.            
            if (this.validateTaskParameters(taskParametersRaw)) {
            	// Package all the task parameters into an object.
            	// Parameters are converted into proper types.
				let taskParameters = {
					'name': this.name, 
					'initialOffset': parseFloat(this.initialOffset),
					'activationOffset': parseFloat(this.activationOffset),
					'duration': parseFloat(this.duration),
					'period': parseFloat(this.period),
					'inputs': this.inputs.split(',').map(item => item.trim()).filter(Boolean),
					'outputs': this.outputs.split(',').map(item => item.trim()).filter(Boolean)
				};
            
                // Call the handler.
            	handler(taskParameters);
            }
        });
    }
    
    validateTaskParameters(taskParameters) {
		if (taskParameters.name == null || taskParameters.name == '') {
			alert('taskParameters name cannot be blank.');
			return false;
		}
		
		if (taskParameters.initialOffset == null || !$.isNumeric(taskParameters.initialOffset)) {
			alert('Initial offset has to be a decimal number.');
			return false;
		}
		let initialOffset = parseFloat(taskParameters.initialOffset);
		if (initialOffset < 0) {
			alert('Initial offset cannot be negative');
			return false;
		}

		if (taskParameters.activationOffset == null || !$.isNumeric(taskParameters.activationOffset)) {
			alert('Activation offset has to be a decimal number.');
			return false;
		}
		let activationOffset = parseFloat(taskParameters.activationOffset);
		if (activationOffset < 0) {
			alert('Activation offset cannot be negative');
			return false;
		}

		if (taskParameters.duration == null || !$.isNumeric(taskParameters.duration)) {
			alert('Duration offset has to be a decimal number.');
			return false;
		}
		
		let duration = parseFloat(taskParameters.duration);
		if (duration <= 0) {
			alert('Duration has to be greater than 0.');
			return false;
		}
		
		if (taskParameters.period == null || !$.isNumeric(taskParameters.period)) {
			alert('Period offset has to be a decimal number.');
			return false;
		}
		
		let period = parseFloat(taskParameters.period);
		if (period <= 0) {
			alert('Period has to be greater than 0.');
			return false;
		}
		
		if ((activationOffset + duration) > period) {
			alert('Period is shorter than the combined activation offset and LET duration.');
			return false;
		}
		
		if (taskParameters.inputs == null || taskParameters.inputs == '') {
			alert('Specify at least one input.');
			return false;
		}
		
		if (taskParameters.outputs == null || taskParameters.outputs == '') {
			alert('Specify at least one output.');
			return false;
		}
		
    	return true;
    }
    
    
    // -----------------------------------------------------
    // Class methods

	updatePreview(taskParameters) {
		// Delete the existing preview, if it exists
		this.taskPreview.selectAll("*").remove();
		
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
		this.taskPreview
		    .append('svg')
		      .attr('width', 700)
		      .attr('height', 60)
		    .append('g')
		      .attr('transform', `translate(10, 0)`);

        // Create a new SVG group for each task, and populate with its data
		const group =
		bar.selectAll('g')
		   .data([taskParameters])
		   .enter()
		   .append('g')
			 .attr('transform', (d, i) => `translate(0, ${i * (barHeight + barMargin)})`);

        // Add each task's LET duration
		group.append('rect')
             .attr('x', d => scale(d.initialOffset + d.activationOffset))
			 .attr('width', d => scale(d.duration))
			 .attr('height', barHeight);
		
		// Add horizontal line to indicate each task's initial offset
		group.append('line')
		     .attr('x1', 0)
		     .attr('x2', d =>scale(d.initialOffset))
		     .attr('y1', (d, i) => `${(i + 1) * (barHeight + barMargin)}`)
		     .attr('y2', (d, i) => `${(i + 1) * (barHeight + barMargin)}`)
		     .attr('class', 'initialOffset');

        // Add horizontal line to indicate each task's period
		group.append('line')
		     .attr('x1', d =>scale(d.initialOffset))
		     .attr('x2', d =>scale(d.initialOffset + d.period))
		     .attr('y1', (d, i) => `${(i + 1) * (barHeight + barMargin)}`)
		     .attr('y2', (d, i) => `${(i + 1) * (barHeight + barMargin)}`)
		     .attr('class', 'period');

        // Add vertical lines around the initial offset and period
		group.append('line')
		     .attr('x1', 0)
		     .attr('x2', 0)
		     .attr('y1', (d, i) => `${(i + 1) * (barHeight + barMargin) + 3*barMargin}`)
		     .attr('y2', (d, i) => `${(i + 1) * (barHeight + barMargin) - 3*barMargin}`)
		     .attr('class', 'boundary');
		group.append('line')
		     .attr('x1', d =>scale(d.initialOffset))
		     .attr('x2', d =>scale(d.initialOffset))
		     .attr('y1', (d, i) => `${(i + 1) * (barHeight + barMargin) + 3*barMargin}`)
		     .attr('y2', (d, i) => `${(i + 1) * (barHeight + barMargin) - 3*barMargin}`)
		     .attr('class', 'boundary');
		group.append('line')
		     .attr('x1', d =>scale(d.initialOffset + d.period))
		     .attr('x2', d =>scale(d.initialOffset + d.period))
		     .attr('y1', (d, i) => `${(i + 1) * (barHeight + barMargin) + 3*barMargin}`)
		     .attr('y2', (d, i) => `${(i + 1) * (barHeight + barMargin) - 3*barMargin}`)
		     .attr('class', 'boundary');
		     
		bar.append('g')
		   .attr('transform', (d, i) => `translate(0, ${[taskParameters].length * (barHeight + 7 * barMargin)})`)
		   .call(x_axis)
		   .call(g => g.select(".domain").remove());
	}

    updateTasks(tasks) {
        alert(`ViewTask.updateTasks(${JSON.stringify(tasks)})`);
        
        const tasksUpdate = this.taskSet
          .selectAll('li')
          .data(tasks)
        
        const tasksEnter = tasksUpdate.enter().append('li');
        const tasksExit = tasksUpdate.exit().remove();
        tasksEnter.merge(tasksUpdate).text(task => this.formatTaskInfo(task));
    }
    
    formatTaskInfo(task) {
        return `${task.name}: initial offset = ${task.initialOffset}, activation offset = ${task.activationOffset}, duration = ${task.duration}, period = ${task.period}, inputs = ${task.inputs}, outputs = ${task.outputs}`;
    }
    
    toString() {
        return "ViewTask";
    }
}

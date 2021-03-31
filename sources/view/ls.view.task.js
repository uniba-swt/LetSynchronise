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
    clearButton = null;
    
    exportButton = null;
    importButton = null;

    taskPreview = null;

    taskSet = null;

    deleteHandler = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-design');

		// System export or import
		this.exportButton = this.root.querySelector('#export-system');
        this.importButton = this.root.querySelector('#import-system');

        
        // Define or edit task
        this.nameField = this.root.querySelector('#name');
        this.initialOffsetField = this.root.querySelector('#initial-offset');
        this.activationOffsetField = this.root.querySelector('#activation-offset');
        this.durationField = this.root.querySelector('#duration');
        this.periodField = this.root.querySelector('#period');
        this.inputsField = this.root.querySelector('#inputs');
        this.outputsField = this.root.querySelector('#outputs');
        
        this.previewButton = this.root.querySelector('#previewTask');
        this.submitButton = this.root.querySelector('#submitTask');
        this.clearButton = this.root.querySelector('#clearTask');

        this.taskPreview = d3.select('#view-task-preview');

        // Current task set
        this.taskSet = d3.select('#view-task-set');

        // Listeners
        this.setupPreviewButtonListener();
        this.setupClearButtonListener();
    }
    
    get name() {
        return this.nameField.value;
    }
    
    set name(name) {
    	this.nameField.value = name;
    }
    
    get initialOffset() {
    	return this.initialOffsetField.value;
    }

    set initialOffset(initialOffset) {
    	return this.initialOffsetField.value = initialOffset;
    }
    
    get activationOffset() {
    	return this.activationOffsetField.value;
    }

    set activationOffset(activationOffset) {
    	return this.activationOffsetField.value = activationOffset;
    }
    
    get duration() {
    	return this.durationField.value;
    }
    
    set duration(duration) {
    	return this.durationField.value = duration;
    }
    
    get period() {
    	return this.periodField.value;
    }
    
    set period(period) {
    	return this.periodField.value = period;
    }
    
    get inputs() {
    	return this.inputsField.value;
    }
    
    set inputs(inputs) {
    	return this.inputsField.value = inputs;
    }
    
    get outputs() {
    	return this.outputsField.value;
    }
    
    set outputs(outputs) {
    	return this.outputsField.value = outputs;
    }
    
    get taskParametersRaw() {
		// Package all the task paramters as is into an object.
		return {
			'name': this.name,
			'initialOffset': this.initialOffset,
			'activationOffset': this.activationOffset,
			'duration': this.duration,
			'period': this.period,
			'inputs': this.inputs,
			'outputs': this.outputs
		};
    }
    
    get taskParametersClean() {
        // Package all the task paramters in their correct types into an object.
        return {
            'name': this.name.trim(),
            'initialOffset': parseFloat(this.initialOffset),
            'activationOffset': parseFloat(this.activationOffset),
            'duration': parseFloat(this.duration),
            'period': parseFloat(this.period),
            'inputs': this.inputs.split(',').map(item => item.trim()).filter(Boolean),
            'outputs': this.outputs.split(',').map(item => item.trim()).filter(Boolean)
        };
    }
    
    
    // -----------------------------------------------------
    // Setup listeners
    
    setupPreviewButtonListener() {
        this.previewButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the inputs.            
            if (this.validateTaskParameters(this.taskParametersRaw)) {
                // Call the handler.
            	this.updatePreview(this.taskParametersClean);
            }
        });
    }
    
    setupClearButtonListener() {
        this.clearButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Clear all the task parameters in the view.
            this.name = '';
            this.initialOffset = '';
            this.activationOffset = '';
            this.duration = '';
            this.period = '';
            this.inputs = '';
            this.outputs = '';
            
			// Clear the preview.
			this.clearPreview();
            this.clearSelected();
        });
    }

    setupDeleteButtonListener(elementId) {
        const deleteButton = this.root.querySelector(`[id='${elementId}']`);
        
        deleteButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Call the handler.
            this.deleteHandler(elementId);
        });
    }
    

    // -----------------------------------------------------
    // Registration of handlers from the controller

    registerSubmitHandler(handler) {
        this.submitButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
			
            // Validate the inputs.            
            if (this.validateTaskParameters(this.taskParametersRaw)) {
                // Call the handler.
            	handler(this.taskParametersClean);
            }
        });
    }
    
    registerDeleteHandler(handler) {
        this.deleteHandler = handler;
    }
    
    registerExportButtonListener(handler) {
        this.exportButton.addEventListener('click', event => {
            event.preventDefault();
            handler();
        });
    }

    registerImportButtonListener(handler) {
        this.importButton.addEventListener('click', event => {
            event.preventDefault(); 
            handler();
        });
    }
    
    validateTaskParameters(taskParameters) {
		if (taskParameters.name == null || taskParameters.name.trim() == '') {
			alert('Name cannot be blank.');
			return false;
		}
		
		if (taskParameters.initialOffset == null || !$.isNumeric(taskParameters.initialOffset)) {
			alert('Initial offset has to be a decimal number.');
			return false;
		}
		const initialOffset = parseFloat(taskParameters.initialOffset);
		if (initialOffset < 0) {
			alert('Initial offset cannot be negative');
			return false;
		}

		if (taskParameters.activationOffset == null || !$.isNumeric(taskParameters.activationOffset)) {
			alert('Activation offset has to be a decimal number.');
			return false;
		}
		const activationOffset = parseFloat(taskParameters.activationOffset);
		if (activationOffset < 0) {
			alert('Activation offset cannot be negative');
			return false;
		}

		if (taskParameters.duration == null || !$.isNumeric(taskParameters.duration)) {
			alert('Duration offset has to be a decimal number.');
			return false;
		}
		
		const duration = parseFloat(taskParameters.duration);
		if (duration <= 0) {
			alert('Duration has to be greater than 0.');
			return false;
		}
		
		if (taskParameters.period == null || !$.isNumeric(taskParameters.period)) {
			alert('Period offset has to be a decimal number.');
			return false;
		}
		
		const period = parseFloat(taskParameters.period);
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
        const inputs = taskParameters.inputs.split(',').map(item => item.trim()).filter(Boolean)
        const duplicateInputs = inputs.filter((port, index, self) => self.indexOf(port) !== index);
        if (duplicateInputs.length != 0) {
            alert(`Remove duplicate input ports: ${duplicateInputs.join(', ')}.`);
            return false;
        }
		
		if (taskParameters.outputs == null || taskParameters.outputs == '') {
			alert('Specify at least one output.');
			return false;
		}
        const outputs = taskParameters.outputs.split(',').map(item => item.trim()).filter(Boolean)
        const duplicateOutputs = outputs.filter((port, index, self) => self.indexOf(port) !== index);
        if (duplicateOutputs.length != 0) {
            alert(`Remove duplicate output ports: ${duplicateOutputs.join(', ')}.`);
            return false;
        }
		
        const inputsOutputs = inputs.concat(outputs);
        const duplicatePortNames = inputsOutputs.filter((port, index, self) => self.indexOf(port) !== index);
        if (duplicatePortNames.length != 0) {
            alert(`Remove input and output ports with same names: ${duplicatePortNames.join(', ')}.`);
            return false;
        }
        
    	return true;
    }
    
    
    // -----------------------------------------------------
    // Class methods
    
    clearPreview() {
        // Delete the existing preview, if it exists
		this.taskPreview.selectAll('*').remove();
    }
    
    clearSelected() {
        this.taskSet.node().querySelectorAll('li')
            .forEach((item) => { item.classList.remove('taskSelected') });
    }
    
    updatePreview(taskParameters) {
        // Delete the existing task preview, if it exists
        this.clearPreview();
        
        // Draw the task preview
        this.draw(this.taskPreview, taskParameters);
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

        // Set up the canvas
        const anchor =
        parentElement
            .append('a')

		const group =
        anchor
		    .append('svg')
		    .append('g')
		      .attr('transform', `translate(${View.SvgPadding}, ${View.SvgPadding})`);
        
        // -----------------------------
        // Group for textual information
        const textInfo =
        group.append('g')
             .attr('transform', `translate(0, ${View.SvgPadding})`);
        
        // Add the task's name, inputs, and outputs
        textInfo.append('text')
                .attr('dy', '0em')
                .text(`Task: ${taskParameters.name}`);
        textInfo.append('text')
                .attr('dy', '1.3em')
                .text(`Inputs: ${Utility.FormatTaskPorts(taskParameters.name, taskParameters.inputs)}`);
        textInfo.append('text')
                .attr('dy', '2.6em')
                .text(`Outputs: ${Utility.FormatTaskPorts(taskParameters.name, taskParameters.outputs)}`);

        // -----------------------------
        // Group for graphical information
        const graphInfo =
        group.append('g')
             .attr('transform', `translate(0, 60)`);
        
        // Add the task's LET duration
        graphInfo.append('rect')
                 .attr('x', scale(taskParameters.initialOffset + taskParameters.activationOffset))
                 .attr('width', scale(taskParameters.duration))
                 .attr('height', View.BarHeight);
		
		// Add horizontal line for the task's initial offset
        graphInfo.append('line')
                 .attr('x1', 0)
                 .attr('x2', scale(taskParameters.initialOffset))
                 .attr('y1', `${View.BarHeight + View.BarMargin}`)
                 .attr('y2', `${View.BarHeight + View.BarMargin}`)
                 .attr('class', 'initialOffset');

        // Add horizontal line for the task's period
        graphInfo.append('line')
                 .attr('x1', scale(taskParameters.initialOffset))
                 .attr('x2', scale(taskParameters.initialOffset + taskParameters.period))
                 .attr('y1', `${View.BarHeight + View.BarMargin}`)
                 .attr('y2', `${View.BarHeight + View.BarMargin}`)
                 .attr('class', 'period');

        // Add vertical lines around the initial offset and period
        graphInfo.append('line')
                 .attr('x1', 0)
                 .attr('x2', 0)
                 .attr('y1', `${View.BarHeight + View.TickHeight + View.BarMargin}`)
                 .attr('y2', `${View.BarHeight - View.TickHeight}`)
                 .attr('class', 'boundary');
        graphInfo.append('line')
                 .attr('x1', scale(taskParameters.initialOffset))
                 .attr('x2', scale(taskParameters.initialOffset))
                 .attr('y1', `${View.BarHeight + View.TickHeight + View.BarMargin}`)
                 .attr('y2', `${View.BarHeight - View.TickHeight}`)
                 .attr('class', 'boundary');
        graphInfo.append('line')
                 .attr('x1', scale(taskParameters.initialOffset + taskParameters.period))
                 .attr('x2', scale(taskParameters.initialOffset + taskParameters.period))
                 .attr('y1', `${View.BarHeight + View.TickHeight + View.BarMargin}`)
                 .attr('y2', `${View.BarHeight - View.TickHeight}`)
                 .attr('class', 'boundary');
        
        graphInfo.append('g')
                 .attr('transform', `translate(0, ${View.BarHeight + 2 * View.TickHeight})`)
                 .call(x_axis)
                 .call(g => g.select('.domain').remove());
        
        return anchor;
	}
    
    updateTasks(taskParametersSet) {
        // Delete the existing preview of the task set, if it exists
        this.taskSet.selectAll('*').remove();
        
        for (const taskParameters of taskParametersSet) {
            const taskListItem = this.taskSet.append('li');
            const anchor = this.draw(taskListItem, taskParameters);
            taskListItem.append('span')
                        .html(dependency => `${Utility.AddDeleteButton(taskParameters.name)}`);
            this.setupDeleteButtonListener(`${taskParameters.name}`);
            
            // Click listener
            anchor.on('click', () => {
                taskListItem.node().parentNode.querySelectorAll('li').forEach((item) => {
					if (item !== taskListItem.node()) { item.classList.remove('taskSelected'); }
				});
                taskListItem.node().classList.toggle('taskSelected');
                this.populateParameterForm(taskParameters);
            });
        }
    }
    
    populateParameterForm(taskParameters) {
        this.name = taskParameters.name;
        this.initialOffset = taskParameters.initialOffset;
        this.activationOffset = taskParameters.activationOffset;
        this.duration = taskParameters.duration;
        this.period = taskParameters.period;
        this.inputs = taskParameters.inputs;
        this.outputs = taskParameters.outputs;
    }
        
    formatTaskParametersInfo(taskParameters) {
        return `${taskParameters.name}: initial offset = ${taskParameters.initialOffset}, activation offset = ${taskParameters.activationOffset}, duration = ${taskParameters.duration}, period = ${taskParameters.period}, inputs = ${Utility.FormatTaskPorts(taskParameters.name, taskParameters.inputs)}, outputs = ${Utility.FormatTaskPorts(taskParameters.name, taskParameters.outputs)}`;
    }
    
    toString() {
        return "ViewTask";
    }
}

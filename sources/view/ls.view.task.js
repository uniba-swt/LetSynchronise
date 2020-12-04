'use strict';

class ViewTask {
    root = null;
    
    nameField = null;
    initialOffsetField = null;
    activationOffsetField = null;
    periodField = null;
    durationField = null;
    inputsField = null;
    outputsField = null;
    
    submitButton = null;
    
    taskSet = null;
    
    constructor() {
        this.root = document.querySelector('#view-task-define');
        
        this.nameField = this.root.querySelector('#name');
        this.initialOffsetField = this.root.querySelector('#initial-offset');
        this.activationOffsetField = this.root.querySelector('#activation-offset');
        this.periodField = this.root.querySelector('#period');
        this.durationField = this.root.querySelector('#duration');
        this.inputsField = this.root.querySelector('#inputs');
        this.outputsField = this.root.querySelector('#outputs');
        
        this.submitButton = this.root.querySelector('#submit');
        
        this.taskPreview = d3.select('#view-task-preview');
        this.taskSet = d3.select('#view-task-set');
        
        this.updatePreview();
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
    
    get period() {
    	return this.periodField.value;
    }
    
    get duration() {
    	return this.durationField.value;
    }
    
    get inputs() {
    	return this.inputsField.value;
    }
    
    get outputs() {
    	return this.outputsField.value;
    }
    
    
    // -----------------------------------------------------
    // Registration of handlers from the controller

    registerSubmitHandler(handler) {
        this.submitButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Package all the task paramters into an object.
            let taskParameters = {
            	'name': this.name, 
            	'initialOffset': this.initialOffset,
            	'activationOffset': this.activationOffset,
            	'period': this.period,
            	'duration': this.duration,
            	'inputs': this.inputs,
            	'outputs': this.outputs
            };

            // Validate the inputs.            
            if (ViewTask.validateTaskParameters(taskParameters)) {
                // Call the handler.
            	handler(taskParameters);
            }
        });
    }
    
    static validateTaskParameters(task) {
		if (task.name == null || task.name == '') {
			alert('Task name cannot be blank.');
			return false;
		}
		
		if (task.initialOffset == null || !$.isNumeric(task.initialOffset)) {
			alert('Initial offset has to be a decimal number.');
			return false;
		}
		
		if (task.activationOffset == null || !$.isNumeric(task.activationOffset)) {
			alert('Activation offset has to be a decimal number.');
			return false;
		}
		
		if (task.period == null || !$.isNumeric(task.period)) {
			alert('Period offset has to be a decimal number.');
			return false;
		}
		
		if (task.duration == null || !$.isNumeric(task.duration)) {
			alert('Period offset has to be a decimal number.');
			return false;
		}
		
		if (task.inputs == null || task.inputs == '') {
			alert('Specify at least one input.');
			return false;
		}
		
		if (task.outputs == null || task.outputs == '') {
			alert('Specify at least one output.');
			return false;
		}
		
    	return true;
    }
    
    
    // -----------------------------------------------------
    // Class methods

	updatePreview() {
		const data3 = [60];

		const scale =
		d3.scaleLinear()
		  .domain([0, d3.max(data3)])
		  .range([0, 600]);

		// Add scales to axis
		const x_axis =
		d3.axisBottom()
		  .scale(scale);

		const barHeight = 20;
		const barMargin = 2;

		const bar =
		this.taskPreview
		  .attr('width', 700)
		  .attr('height', 50)
		  .append('g')
		  .attr('transform', `translate(50, 10)`);

		const group =
		bar.selectAll('g')
		   .data(data3)
		   .enter()
		   .append('g')
			 .attr('transform', (d, i) => `translate(0, ${i * (barHeight + barMargin)})`);

		group.append('rect')
			 .attr('width', d => scale(d))
			 .attr('height', barHeight)
			 .on('mouseover', function() {
				 d3.select(this)
				   .transition()
					 .ease(d3.easeLinear)
					 .style('fill', 'green');
			 })
			 .on('mouseout', function() {
				 d3.select(this)
				   .transition()
					 .ease(d3.easeExpInOut)
					 .style('fill', 'grey');
			 });

		group.append('text')
			 .attr('x', 10)
			 .attr('y', barHeight * 0.5)
			 .attr('dy', '0.35em')
			 .text(d => `Preview: ${d}`);

		bar.append('g')
		   .attr('transform', (d, i) => `translate(0, ${data3.length * (barHeight + barMargin)})`)
		   .call(x_axis);

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
        return `${task.name}: initial offset = ${task.initialOffset}, activation offset = ${task.activationOffset}, period = ${task.period}, duration = ${task.duration}, inputs = ${task.inputs}, outputs = ${task.outputs}`;
    }
    
    toString() {
        return "ViewTask";
    }
}

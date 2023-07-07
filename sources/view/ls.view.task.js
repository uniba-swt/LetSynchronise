'use strict';

class ViewTask {
    root = null;
    
    nameField = null;
    priorityField = null;
    initialOffsetField = null;
    activationOffsetField = null;
    durationField = null;
    periodField = null;
    inputsField = null;
    outputsField = null;
    wcetField = null;
    acetField = null;
    bcetField = null;
    distributionField = null;
    coreField = null;
    
    previewButton = null;
    submitButton = null;
    clearButton = null;
    
    taskPreview = null;

    taskSet = null;

    deleteHandler = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-design');
        
        // Define or edit a task
        this.nameField = this.root.querySelector('#name');
        this.priorityField = this.root.querySelector('#priority');
        this.initialOffsetField = this.root.querySelector('#initial-offset');
        this.activationOffsetField = this.root.querySelector('#activation-offset');
        this.durationField = this.root.querySelector('#duration');
        this.periodField = this.root.querySelector('#period');
        this.inputsField = this.root.querySelector('#inputs');
        this.outputsField = this.root.querySelector('#outputs');
        this.wcetField = this.root.querySelector('#wcet');
        this.acetField = this.root.querySelector('#acet');
        this.bcetField = this.root.querySelector('#bcet');
        this.distributionField = this.root.querySelector('#distribution');
        this.coreField = this.root.querySelector('#core');
        
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
    
    get priority() {
        if (this.priorityField.value == null || this.priorityField.value.trim() == '') {
            return null;
        } else {
            return this.priorityField.value;
        }
    }

    set priority(priority) {
        this.priorityField.value = priority;
    }
    
    get initialOffset() {
        return this.initialOffsetField.value;
    }

    set initialOffset(initialOffset) {
        this.initialOffsetField.value = initialOffset;
    }
    
    get activationOffset() {
        return this.activationOffsetField.value;
    }

    set activationOffset(activationOffset) {
        this.activationOffsetField.value = activationOffset;
    }
    
    get duration() {
        return this.durationField.value;
    }
    
    set duration(duration) {
        this.durationField.value = duration;
    }
    
    get period() {
        return this.periodField.value;
    }
    
    set period(period) {
        this.periodField.value = period;
    }
    
    get inputs() {
        return this.inputsField.value;
    }
    
    set inputs(inputs) {
        this.inputsField.value = inputs;
    }
    
    get outputs() {
        return this.outputsField.value;
    }
    
    set outputs(outputs) {
        this.outputsField.value = outputs;
    }
    
    get wcet() {
        return this.wcetField.value;
    }
    
    set wcet(wcet) {
        this.wcetField.value = wcet;
    }

    get acet() {
        return this.acetField.value;
    }
    
    set acet(acet) {
        this.acetField.value = acet;
    }
    
    get bcet() {
        return this.bcetField.value;
    }
    
    set bcet(bcet) {
        this.bcetField.value = bcet;
    }
    
    get distribution() {
        return this.distributionField.value;
    }
    
    set distribution(distribution) {
        this.distributionField.value = distribution;
    }
    
    get core() {
        if (this.coreField.value == null || this.coreField.value.trim() == '') {
            return null;
        } else {
            return this.coreField.value;
        }
    }
    
    set core(core) {
        this.coreField.value = core;
    }
    
    get taskParametersRaw() {
        // Package all the task paramters as is into an object.
        return {
            'name': this.name,
            'priority': this.priority,
            'initialOffset': this.initialOffset,
            'activationOffset': this.activationOffset,
            'duration': this.duration,
            'period': this.period,
            'inputs': this.inputs,
            'outputs': this.outputs,
            'wcet': this.wcet,
            'acet': this.acet,
            'bcet': this.bcet,
            'distribution': this.distribution,
            'core': this.core
        };
    }
    
    get taskParametersClean() {
        // Package all the task paramters in their correct types into an object.
        return {
            'name': this.name.trim(),
            'priority': this.priority == null ? null : Math.abs(parseInt(this.priority, 10)),
            'initialOffset': Math.abs(parseFloat(this.initialOffset)) * Utility.MsToNs,
            'activationOffset': Math.abs(parseFloat(this.activationOffset)) * Utility.MsToNs,
            'duration': Math.abs(parseFloat(this.duration)) * Utility.MsToNs,
            'period': Math.abs(parseFloat(this.period)) * Utility.MsToNs,
            'inputs': this.inputs.split(',').map(item => item.trim()).filter(Boolean),
            'outputs': this.outputs.split(',').map(item => item.trim()).filter(Boolean),
            'wcet': Math.abs(parseFloat(this.wcet)) * Utility.MsToNs,
            'acet': Math.abs(parseFloat(this.acet)) * Utility.MsToNs,
            'bcet': Math.abs(parseFloat(this.bcet)) * Utility.MsToNs,
            'distribution': this.distribution.trim(),
            'core':  this.core.trim()
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
            this.priority = '';
            this.initialOffset = '';
            this.activationOffset = '';
            this.duration = '';
            this.period = '';
            this.inputs = '';
            this.outputs = '';
            this.wcet = '';
            this.acet = '';
            this.bcet = '';
            this.distribution = 'Normal';
            this.core = 'Default';
            
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
    

    validateTaskParameters(taskParameters) {
        if (taskParameters.name == null || taskParameters.name.trim() == '') {
            alert('Task name cannot be blank.');
            return false;
        }
        if (!Utility.ValidName(taskParameters.name.trim())) {
            alert('Task name can only start with an alphabetical or underscore character, and continue with alphanumerical or underscore characters.');
            return false;
        }

        if (taskParameters.priority != null
                && (isNaN(taskParameters.priority) || parseInt(taskParameters.priority) < 0 || taskParameters.priority.split(".").length != 1)) {
            alert('Priority has to be a positive integer. Lowest priority is 0.');
            return false;
        }

        if (taskParameters.initialOffset == null || taskParameters.initialOffset.trim() == '' || isNaN(taskParameters.initialOffset)) {
            alert('Initial offset has to be a decimal number.');
            return false;
        }
        const initialOffset = parseFloat(taskParameters.initialOffset);
        if (initialOffset < 0) {
            alert('Initial offset cannot be negative.');
            return false;
        }
        const initialOffsetNs = initialOffset * Utility.MsToNs;
        if (!Number.isSafeInteger(initialOffsetNs)) {
            alert('Initial offset is unable to be represented with nanosecond precision.');
            return false;
        }

        if (taskParameters.activationOffset == null || taskParameters.activationOffset.trim() == '' || isNaN(taskParameters.activationOffset)) {
            alert('Activation offset has to be a decimal number.');
            return false;
        }
        const activationOffset = parseFloat(taskParameters.activationOffset);
        if (activationOffset < 0) {
            alert('Activation offset cannot be negative.');
            return false;
        }
        const activationOffsetNs = activationOffset * Utility.MsToNs;
        if (!Number.isSafeInteger(activationOffsetNs)) {
            alert('Activation offset is unable to be represented with nanosecond precision.');
            return false;
        }
        
        if (taskParameters.duration == null || taskParameters.duration.trim() == '' || isNaN(taskParameters.duration)) {
            alert('Duration offset has to be a decimal number.');
            return false;
        }
        const duration = parseFloat(taskParameters.duration);
        if (duration <= 0) {
            alert('Duration has to be greater than 0.');
            return false;
        }
        const durationNs = duration * Utility.MsToNs;
        if (!Number.isSafeInteger(durationNs)) {
            alert('Duration offset is unable to be represented with nanosecond precision.');
            return false;
        }
        
        if (taskParameters.period == null || taskParameters.period.trim() == '' || isNaN(taskParameters.period)) {
            alert('Period offset has to be a decimal number.');
            return false;
        }
        const period = parseFloat(taskParameters.period);
        if (period <= 0) {
            alert('Period has to be greater than 0.');
            return false;
        }
        const periodNs = period * Utility.MsToNs;
        if (!Number.isSafeInteger(periodNs)) {
            alert('Period is unable to be represented with nanosecond precision.');
            return false;
        }
        if ((activationOffsetNs + durationNs) > periodNs) {
            alert('Period is shorter than the combined activation offset and LET duration.');
            return false;
        }
        
        if (taskParameters.inputs == null || taskParameters.inputs.trim() == '') {
            alert('Specify at least one input.');
            return false;
        }
        const inputs = taskParameters.inputs.split(',').map(item => item.trim()).filter(Boolean)
        const duplicateInputs = inputs.filter((port, index, self) => self.indexOf(port) !== index);
        if (duplicateInputs.length != 0) {
            alert(`Remove duplicate input ports: ${duplicateInputs.join(', ')}.`);
            return false;
        }
        const invalidInputs = inputs.filter(input => !Utility.ValidName(input));
        if (invalidInputs.length > 0) {
            alert('Input names can only start with an alphabetical or underscore character, '
                   + 'and continue with alphanumerical or underscore characters. '
                   + `Invalid names: ${invalidInputs.join(', ')}.`);
            return false;
        }
        
        if (taskParameters.outputs == null || taskParameters.outputs.trim() == '') {
            alert('Specify at least one output.');
            return false;
        }
        const outputs = taskParameters.outputs.split(',').map(item => item.trim()).filter(Boolean)
        const duplicateOutputs = outputs.filter((port, index, self) => self.indexOf(port) !== index);
        if (duplicateOutputs.length != 0) {
            alert(`Remove duplicate output ports: ${duplicateOutputs.join(', ')}.`);
            return false;
        }
        const invalidOutputs = outputs.filter(output => !Utility.ValidName(output));
        if (invalidOutputs.length > 0) {
            alert('Output names can only start with an alphabetical or underscore character, '
                  + 'and continue with alphanumerical or underscore characters. '
                  + `Invalid names: ${invalidOutputs.join(', ')}.`);
            return false;
        }
        
        const inputsOutputs = inputs.concat(outputs);
        const duplicatePortNames = inputsOutputs.filter((port, index, self) => self.indexOf(port) !== index);
        if (duplicatePortNames.length != 0) {
            alert(`Remove input and output ports with same names: ${duplicatePortNames.join(', ')}.`);
            return false;
        }
        
        if (taskParameters.wcet == null || taskParameters.wcet.trim() == '' || isNaN(taskParameters.wcet)) {
            alert('WCET has to be a decimal number.');
            return false;
        }
        const wcet = parseFloat(taskParameters.wcet);
        if (wcet <= 0) {
            alert('WCET has to be greater than 0.');
            return false;
        }
        const wcetNs = wcet * Utility.MsToNs;
        if (!Number.isSafeInteger(wcetNs)) {
            alert('WCET is unable to be represented with nanosecond precision.');
            return false;
        }
        
        if (taskParameters.acet == null || taskParameters.acet.trim() == '' || isNaN(taskParameters.acet)) {
            alert('ACET has to be a decimal number.');
            return false;
        }
        const acet = parseFloat(taskParameters.acet);
        if (acet <= 0) {
            alert('ACET has to be greater than 0.');
            return false;
        }
        const acetNs = acet * Utility.MsToNs;
        if (!Number.isSafeInteger(acetNs)) {
            alert('ACET is unable to be represented with nanosecond precision.');
            return false;
        }
        
        if (taskParameters.bcet == null || taskParameters.bcet.trim() == '' || isNaN(taskParameters.bcet)) {
            alert('BCET has to be a decimal number.');
            return false;
        }
        const bcet = parseFloat(taskParameters.bcet);
        if (bcet < 0) {
            alert('BCET has to be greater than or equal to 0.');
            return false;
        }
        const bcetNs = bcet * Utility.MsToNs;
        if (!Number.isSafeInteger(bcetNs)) {
            alert('BCET is unable to be represented with nanosecond precision.');
            return false;
        }
        
        if (durationNs < wcetNs) {
            alert('WCET cannot be greater than duration.');
            return false;
        }
        if (wcetNs < bcetNs) {
            alert('WCET cannot be less than BCET.');
            return false;
        }
        if (wcetNs < acetNs || acetNs < bcetNs) {
            alert('ACET cannot be less than BCET or greater than WCET.');
            return false;
        }
        
        if (taskParameters.distribution == null || taskParameters.distribution.trim() == '') {
            alert('Choose type of execution time distribution.');
            return false;
        }
        
        if (taskParameters.core == null || taskParameters.core.trim() == '') {
            alert('Core for execution cannot be blank.');
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
          .scale(scale)
          .tickFormat(d => d / Utility.MsToNs);

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
        
        // Add the task's name, execution times, inputs, and outputs
        textInfo.append('text')
                .attr('dy', '0em')
                .text(`Task: ${taskParameters.name}`);
        textInfo.append('text')
                .attr('dy', '1.3em')
                .text(`WCET, ACET, BCET: ${taskParameters.wcet / Utility.MsToNs}, ${taskParameters.acet / Utility.MsToNs}, ${taskParameters.bcet / Utility.MsToNs}`);
        textInfo.append('text')
                .attr('dy', '2.6em')
                .text(`Inputs: ${Utility.FormatTaskPorts(taskParameters.name, taskParameters.inputs)}`);
        textInfo.append('text')
                .attr('dy', '3.9em')
                .text(`Outputs: ${Utility.FormatTaskPorts(taskParameters.name, taskParameters.outputs)}`);

        // Add the task's priority, execution time distribution, and core
        textInfo.append('text')
                .attr('dx', '450px')
                .attr('dy', '0em')
                .text(`Priority: ${taskParameters.priority == null ? 'None' : taskParameters.priority}`);
        textInfo.append('text')
                .attr('dx', '450px')
                .attr('dy', '1.3em')
                .text(`Distribution: ${taskParameters.distribution}`);
        textInfo.append('text')
                .attr('dx', '450px')
                .attr('dy', '2.6em')
                .text(`Core: ${taskParameters.core == null ? 'Default' : taskParameters.core}`);

        // -----------------------------
        // Group for graphical information
        const graphInfo =
        group.append('g')
             .attr('transform', `translate(0, 80)`);
        
        // Add the task's LET duration
        graphInfo.append('rect')
                 .attr('x', scale(taskParameters.initialOffset + taskParameters.activationOffset))
                 .attr('width', scale(taskParameters.duration))
                 .attr('height', View.BarHeight);
        
        // Add the task's execution time
        graphInfo.append('rect')
                 .attr('x', scale(taskParameters.initialOffset + taskParameters.activationOffset))
                 .attr('y', View.BarHeight - View.ExecutionHeight)
                 .attr('width', scale(taskParameters.wcet))
                 .attr('height', View.ExecutionHeight)
                 .attr('class', 'wcet');
        graphInfo.append('rect')
                 .attr('x', scale(taskParameters.initialOffset + taskParameters.activationOffset))
                 .attr('y', View.BarHeight - View.ExecutionHeight)
                 .attr('width', scale(taskParameters.bcet))
                 .attr('height', View.ExecutionHeight)
                 .attr('class', 'bcet');

        
        // Add horizontal line for the task's initial offset
        graphInfo.append('line')
                 .attr('x1', 0)
                 .attr('x2', scale(taskParameters.initialOffset))
                 .attr('y1', View.BarHeight + View.BarMargin)
                 .attr('y2', View.BarHeight + View.BarMargin)
                 .attr('class', 'initialOffset');

        // Add horizontal line for the task's period
        graphInfo.append('line')
                 .attr('x1', scale(taskParameters.initialOffset))
                 .attr('x2', scale(taskParameters.initialOffset + taskParameters.period))
                 .attr('y1', View.BarHeight + View.BarMargin)
                 .attr('y2', View.BarHeight + View.BarMargin)
                 .attr('class', 'period');

        // Add vertical lines around the initial offset and period
        graphInfo.append('line')
                 .attr('x1', 0)
                 .attr('x2', 0)
                 .attr('y1', View.BarHeight + View.TickHeight + View.BarMargin)
                 .attr('y2', `0`)
                 .attr('class', 'boundary');
        graphInfo.append('line')
                 .attr('x1', scale(taskParameters.initialOffset))
                 .attr('x2', scale(taskParameters.initialOffset))
                 .attr('y1', View.BarHeight + View.TickHeight + View.BarMargin)
                 .attr('y2', `0`)
                 .attr('class', 'boundary');
        graphInfo.append('line')
                 .attr('x1', scale(taskParameters.initialOffset + taskParameters.period))
                 .attr('x2', scale(taskParameters.initialOffset + taskParameters.period))
                 .attr('y1', View.BarHeight + View.TickHeight + View.BarMargin)
                 .attr('y2', 0)
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
                        .html(dependency => Utility.AddDeleteButton(taskParameters.name));
            this.setupDeleteButtonListener(taskParameters.name);
            
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
        this.priority = taskParameters.priority == null ? '' : taskParameters.priority;
        this.initialOffset = taskParameters.initialOffset / Utility.MsToNs;
        this.activationOffset = taskParameters.activationOffset / Utility.MsToNs;
        this.duration = taskParameters.duration / Utility.MsToNs;
        this.period = taskParameters.period / Utility.MsToNs;
        this.inputs = taskParameters.inputs;
        this.outputs = taskParameters.outputs;
        this.wcet = taskParameters.wcet / Utility.MsToNs;
        this.acet = taskParameters.acet / Utility.MsToNs;
        this.bcet = taskParameters.bcet / Utility.MsToNs;
        this.distribution = taskParameters.distribution;
    }
        
    formatTaskParametersInfo(taskParameters) {
        return `${taskParameters.name}: priority = ${taskParameters.priority}, initial offset = ${taskParameters.initialOffset}, activation offset = ${taskParameters.activationOffset}, duration = ${taskParameters.duration}, period = ${taskParameters.period}, inputs = ${Utility.FormatTaskPorts(taskParameters.name, taskParameters.inputs)}, outputs = ${Utility.FormatTaskPorts(taskParameters.name, taskParameters.outputs)}, wcet = ${taskParameters.wcet}, acet = ${taskParameters.acet}, bcet = ${taskParameters.bcet}, distribution = ${taskParameters.distribution}`;
    }
    
    toString() {
        return "ViewTask";
    }
}

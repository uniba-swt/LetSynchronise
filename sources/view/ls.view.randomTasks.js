'use strict';

class ViewRandomTasks {
    root = null;
    
    randomTasksModalBody = null;
    
    numTasksField = null;
    periodField = null;
    minDurationField = null;
    maxDurationField = null;
    minInitialOffsetField = null;
    maxInitialOffsetField = null;
    minWCETField = null;
    maxWCETField = null;
    numDependenciesField = null;

    submitButton = null;
    
    constructor() {
        this.root = document.querySelector('#nav-design-tab'); 
        
        this.randomTasksModalBody = d3.select('#view-random-tasks-modal-body');
    }

    get numTasks() {
        return this.numTasksField.value;
    }

    set numTasks(numTasks) {
        this.numTasksField.value = numTasks;
    }

    get period() {
        return this.periodField.value;
    }

    set period(period) {
        this.periodField.value = period;
    }

    get minDuration() {
        return this.minDurationField.value;
    }

    set minDuration(minDuration) {
        this.minDurationField.value = minDuration;
    }

    get maxDuration() {
        return this.maxDurationField.value;
    }

    set maxDuration(maxDuration) {
        this.maxDurationField.value = maxDuration;
    }

    get minInitialOffset() {
        return this.minInitialOffsetField.value;
    }

    set minInitialOffset(minInitialOffset) {
        this.minInitialOffsetField.value = minInitialOffset;
    }

    get maxInitialOffset() {
        return this.maxInitialOffsetField.value;
    }

    set maxInitialOffset(maxInitialOffset) {
        this.maxInitialOffsetField.value = maxInitialOffset;
    }

    get minWCET() {
        return this.minWCETField.value;
    }

    set minWCET(minWCET) {
        this.minWCETField.value = minWCET;
    }

    get maxWCET() {
        return this.maxWCETField.value;
    }

    set maxWCET(maxWCET) {
        this.maxWCETField.value = maxWCET;
    }

    get numDependencies() {
        return this.numDependenciesField.value;
    }

    set numDependencies(numDependencies) {
        this.numDependenciesField.value = numDependencies;
    }

    get randomTasksRaw() {
        return {
            'numTasks': this.numTasks,
            'period': this.period,
            'minDuration': this.minDuration,
            'maxDuration': this.maxDuration,
            'minInitialOffset': this.minInitialOffset,
            'maxInitialOffset': this.maxInitialOffset,
            'minWCET': this.minWCET,
            'maxWCET': this.maxWCET,
            'numDependencies': this.numDependencies
        }
    }

    get randomTasksClean() {
        let newPeriod = [];
        for (let p of this.period) {
            newPeriod.push(Math.abs(parseFloat(p.trim())) * Utility.MsToNs);
        }

        this.periodField.value = newPeriod

        return {
            'numTasks': parseInt(this.numTasks.trim()),
            'period': this.period,
            'minDuration': Math.abs(parseFloat(this.minDuration.trim())) * Utility.MsToNs,
            'maxDuration': Math.abs(parseFloat(this.maxDuration.trim())) * Utility.MsToNs,
            'minInitialOffset': Math.abs(parseFloat(this.minInitialOffset.trim())) * Utility.MsToNs,
            'maxInitialOffset': Math.abs(parseFloat(this.maxInitialOffset.trim())) * Utility.MsToNs,
            'minWCET': Math.abs(parseFloat(this.minWCET.trim())) * Utility.MsToNs,
            'maxWCET': Math.abs(parseFloat(this.maxWCET.trim())) * Utility.MsToNs,
            'numDependencies': parseInt(this.numDependencies.trim())
        }
    }


    // -----------------------------------------------------
    // Registration of handlers from the controller

    registerSubmitHandler(handler) {
        const modal = document.getElementById('generate-random-taskset-modal');

        if(modal) {
            modal.addEventListener('shown.bs.modal', () => {
                this.submitButton = modal.querySelector('#submit-random-tasks');

                this.submitButton.addEventListener('click', event => {
                    this.setFormFields(modal);
                    event.preventDefault();

                    if (this.validateParameters(this.randomTasksRaw)) {
                        handler(this.randomTasksClean);

                        modal.querySelector('#view-random-tasks').reset()
                        bootstrap.Modal.getInstance(modal).hide();
                    }
                })
            })
        }
    }

    setFormFields(modal) {
        this.numTasksField = modal.querySelector('#view-num-tasks');
        this.periodField = modal.querySelectorAll('input[name="view-random-tasks-period"]:checked');
        this.minDurationField = modal.querySelector('#view-min-duration');
        this.maxDurationField = modal.querySelector('#view-max-duration');
        this.minInitialOffsetField = modal.querySelector('#view-min-initial-offset');
        this.maxInitialOffsetField = modal.querySelector('#view-max-initial-offset');
        this.minWCETField = modal.querySelector('#view-min-wcet');
        this.maxWCETField = modal.querySelector('#view-max-wcet');
        this.numDependenciesField = modal.querySelector('#view-num-dependencies');

        let periods = []
        for (let p of this.periodField) {
            periods.push(p.value)
        }

        this.periodField.value = periods
    }
    
    clearRandomTasksModal() {
        this.randomTasksModalBody.selectAll('*').remove();
    }

    validateParameters(parameters) {
        const minDuration = parseFloat(parameters.minDuration.trim());
        const maxDuration = parseFloat(parameters.maxDuration.trim());
        const minInitialOffset = parseFloat(parameters.minInitialOffset.trim());
        const maxInitialOffset = parseFloat(parameters.maxInitialOffset.trim());
        const minWCET = parseFloat(parameters.minWCET.trim());
        const maxWCET = parseFloat(parameters.maxWCET.trim());

        if (isNaN(parameters.numTasks)) {
            alert('Number of tasks value must be a number.');
            return false;
        }
        if (!Utility.ValidInteger(parameters.numTasks)) {
            alert('Number of tasks value must be an integer.')
            return false;
        }

        if (parameters.period.length == 0) {
            alert('You must select at least 1 LET Period.');
            return false;
        }

        if (isNaN(minDuration)) {
            alert('Minimum LET Duration must be a number.');
            return false;
        }
        if (isNaN(maxDuration)) {
            alert('Maximum LET Duration must be a number.');
            return false;
        }
        if (minDuration > maxDuration) {
            alert('Minimum LET Duration cannot be greater than Maximum LET Duration.');
            return false;
        }

        if (isNaN(minInitialOffset)) {
            alert('Minimum Initial Offset must be a number.');
            return false;
        }
        if (isNaN(maxInitialOffset)) {
            alert('Maximum Initial Offset must be a number.');
            return false;
        }
        if (minInitialOffset > maxInitialOffset) {
            alert("Minimum Initial Offset cannot be greater than Maximum Initial Offset.");
            return false;
        }

        if (isNaN(minWCET)) {
            alert('Minimum WCET must be a number.');
            return false;
        }
        if (isNaN(maxWCET)) {
            alert('Maximum WCET must be a number.');
            return false;
        }
        if (minWCET > maxWCET) {
            alert('Minimum WCET cannot be greater than Maximum WCET');
            return false;
        }

        if (maxWCET > maxDuration || minWCET > maxDuration) {
            alert('WCET values cannot be greater than Maximum LET Duration');
            return false;
        }

        let flag = false;

        for (let p of parameters.period) {
            if (parseFloat(p.trim()) >= maxDuration) {
                flag = true;
            }
        }

        if (!flag) {
            alert('A LET Period that is greater than Maximum LET Duration must be selected.');
            return false;
        }

        return true;
    }

    toString() {
        return "ViewRandomTasks";
    }
    
}

'use strict';

class ViewRandomTasks {
    root = null;
    modal = null;
    
    openModalButton = null;
    
    numTasksField = null;
    numDependenciesField = null;
    periodsField = null;
    minDurationField = null;
    maxDurationField = null;
    minInitialOffsetField = null;
    maxInitialOffsetField = null;
    minUtilisationField = null;
    maxUtilisationField = null;

    submitButton = null;
    
    constructor() {
        this.root = document.querySelector('#nav-design');

        // Open the random task set generator
        this.openModalButton = this.root.querySelector('#generateRandom');

        // Define and generate a random task set
        this.modal = this.root.querySelector('#generate-random-taskset-modal');
        this.numTasksField = this.modal.querySelector('#view-num-tasks');
        this.numDependenciesField = this.modal.querySelector('#view-num-dependencies');
        this.periodsField = this.modal.querySelector('#view-random-tasks-periods');
        this.minDurationField = this.modal.querySelector('#view-min-duration');
        this.maxDurationField = this.modal.querySelector('#view-max-duration');
        this.minInitialOffsetField = this.modal.querySelector('#view-min-initial-offset');
        this.maxInitialOffsetField = this.modal.querySelector('#view-max-initial-offset');
        this.minUtilisationField = this.modal.querySelector('#view-min-utilisation');
        this.maxUtilisationField = this.modal.querySelector('#view-max-utilisation');
        
        this.submitButton = this.modal.querySelector('#submit-random-tasks');
        
        // Listeners
        this.setupOpenModalButtonListener();
    }

    get numTasks() {
        return this.numTasksField.value;
    }

    set numTasks(numTasks) {
        this.numTasksField.value = numTasks;
    }

    get periods() {
        const selectedPeriods = this.periodsField.querySelectorAll('input:checked');
        return [...selectedPeriods].map(period => period.value);
    }

    set periods(periods) {
        this.periodsField.value = periods;
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

    get minUtilisation() {
        return this.minUtilisationField.value;
    }

    set minUtilisation(minUtilisation) {
        this.minUtilisationField.value = minUtilisation;
    }

    get maxUtilisation() {
        return this.maxUtilisationField.value;
    }

    set maxUtilisation(maxUtilisation) {
        this.maxUtilisationField.value = maxUtilisation;
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
            'numDependencies': this.numDependencies,
            'periods': this.periods,
            'minDuration': this.minDuration,
            'maxDuration': this.maxDuration,
            'minInitialOffset': this.minInitialOffset,
            'maxInitialOffset': this.maxInitialOffset,
            'minUtilisation': this.minUtilisation,
            'maxUtilisation': this.maxUtilisation
        }
    }

    get randomTasksClean() {
        return {
            'numTasks': parseInt(this.numTasks.trim()),
            'numDependencies': parseInt(this.numDependencies.trim()),
            'periods': this.periods.map(period => parseInt(period.trim()) * Utility.MsToNs),
            'minInitialOffset': Math.abs(parseFloat(this.minInitialOffset.trim())) * Utility.MsToNs,
            'maxInitialOffset': Math.abs(parseFloat(this.maxInitialOffset.trim())) * Utility.MsToNs,
            'minDuration': Math.abs(parseInt(this.minDuration.trim())),
            'maxDuration': Math.abs(parseInt(this.maxDuration.trim())),
            'minUtilisation': Math.abs(parseInt(this.minUtilisation.trim())),
            'maxUtilisation': Math.abs(parseInt(this.maxUtilisation.trim()))
        }
    }

    
    // -----------------------------------------------------
    // Setup listeners
    
    setupOpenModalButtonListener() {
        this.openModalButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
        });
    }
    

    // -----------------------------------------------------
    // Registration of handlers from the controller
    
    registerSubmitHandler(handler) {
        this.submitButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the task set parameters.
            if (this.validateParameters(this.randomTasksRaw)) {
                handler(this.randomTasksClean);

                bootstrap.Modal.getInstance(this.modal).hide();
            }
        });
    }

    validateParameters(parameters) {
        if (!Utility.ValidPositiveInteger(parameters.numTasks)) {
            alert('Number of tasks has to be a positive integer number.')
            return false;
        }
        const numTasks = parseInt(parameters.numTasks);
        if (numTasks == 0) {
            alert('Number of tasks has to be at least one.')
            return false;
        }
        
        if (!Utility.ValidPositiveInteger(parameters.numDependencies)) {
            alert('Number of dependencies has to be a positive integer number.')
            return false;
        }

        if (parameters.periods.length == 0) {
            alert('At least one period has to be selected.');
            return false;
        }
        
        if (!Utility.ValidPositiveDecimal(parameters.minInitialOffset)) {
            alert('Minimum initial offset has to be a positive decimal number.');
            return false;
        }
        const minInitialOffsetNs = parseFloat(parameters.minInitialOffset) * Utility.MsToNs;
        if (!Number.isSafeInteger(minInitialOffsetNs)) {
            alert('Minimum initial offset is unable to be represented with nanosecond precision.');
            return false;
        }
        
        if (!Utility.ValidPositiveDecimal(parameters.maxInitialOffset)) {
            alert('Maximum initial offset has to be a positive decimal number.');
            return false;
        }
        const maxInitialOffsetNs = parseFloat(parameters.maxInitialOffset) * Utility.MsToNs;
        if (!Number.isSafeInteger(maxInitialOffsetNs)) {
            alert('Maximum initial offset is unable to be represented with nanosecond precision.');
            return false;
        }
        
        if (minInitialOffsetNs > maxInitialOffsetNs) {
            alert("Minimum initial offset cannot be greater than the maximum initial offset.");
            return false;
        }

        if (!Utility.ValidPositiveInteger(parameters.minDuration)) {
            alert('Minimum duration has to be a positive integer percentage.');
            return false;
        }
        const minDuration = parseInt(parameters.minDuration.trim());
        if (minDuration > 100) {
            alert('Minimum duration cannot be greater than 100%.');
            return false;
        }

        if (!Utility.ValidPositiveInteger(parameters.maxDuration)) {
            alert('Maximum duration has to be a positive integer percentage.');
            return false;
        }
        const maxDuration = parseInt(parameters.maxDuration.trim());
        if (maxDuration > 100) {
            alert('Maximum duration cannot be greater than 100%.');
            return false;
        }
        
        if (minDuration > maxDuration) {
            alert('Minimum duration cannot be greater than the maximum duration.');
            return false;
        }

        if (!Utility.ValidPositiveInteger(parameters.minUtilisation)) {
            alert('Minimum utilisation has to be a positive integer percentage.');
            return false;
        }
        const minUtilisation = parseInt(parameters.minUtilisation.trim());
        if (minUtilisation > 100) {
            alert('Minimum utilisation cannot be greater than 100%.');
            return false;
        }

        if (!Utility.ValidPositiveInteger(parameters.maxUtilisation)) {
            alert('Maximum utilisation has to be a positive integer percentage.');
            return false;
        }
        const maxUtilisation = parseInt(parameters.maxUtilisation.trim());
        if (maxUtilisation > 100) {
            alert('Maximum utilisation cannot be greater than 100%.');
            return false;
        }
        
        if (minUtilisation > maxUtilisation) {
            alert('Minimum utilisation cannot be greater than the maximum utilisation.');
            return false;
        }

        return true;
    }

    toString() {
        return "ViewRandomTasks";
    }
    
}

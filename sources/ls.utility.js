'use strict'

class Utility {
    static get MsToNs() {
        return 1000000;
    }
    
    static ValidName(name) {
        return (/^([A-Za-z]|_)([A-Za-z0-9]|_)*$/).test(name);
    }

    static ValidInteger(value) {
        if (Number.isInteger(value)) {
            return true;
        }
        
        if (value == null || isNaN(value) || typeof value != 'string') {
            return false;
        }
        
        return (/^-?(\d+)$/).test(value.trim());
    }
    
    static ValidPositiveInteger(value) {
        return Utility.ValidInteger(value) && parseInt(value) >= 0;
    }
    
    static ValidDecimal(value) {
        if (typeof value == 'number') {
            return true;
        }
        
        if (value == null || isNaN(value) || typeof value != 'string') {
            return false;
        }
        
        return (/^-?(\d+)$/).test(value.trim()) || (/^-?(\d*).(\d+)$/).test(value.trim());
    }
    
    static ValidPositiveDecimal(value) {
        return Utility.ValidDecimal(value) && parseFloat(value) >= 0;
    }
    
    static MaxOfArray(array) {
        return array.reduce(function(a, b) {
            return Math.max(a, b);
        });
    }
    
    static DecimalPlaces(number) {
        if (Math.floor(number) !== number) {
            return number.toString().split(".")[1].length || 0;
        }
        
        return 0;
    }
    
    static LeastCommonMultiple(x, y) {
        if (!x || !y) {
            return 0;
        } else {
            return Math.abs((x / Utility.GreatestCommonDivisor(x, y)) * y);
        }
    }
    
    static GreatestCommonDivisor(x, y) {
        x = Math.abs(x);
        y = Math.abs(y);
                
        while (y) {
            const t = y;
            y = x % y;
            x = t;
        }
        
        return x;
    }
    
    static LeastCommonMultipleOfArray(array) {
        const decimalPlaces = Utility.MaxOfArray(array.map(element => Utility.DecimalPlaces(element)));
        const scaling = Math.pow(10, decimalPlaces);
        const arrayScaled = array.map(element => element*scaling);
        
        return arrayScaled.reduce(function(a, b) {
            return Utility.LeastCommonMultiple(a, b);
        }) / scaling;
    }
    
    
    // Generate samples from a normal distribution.
    static NormalSample(samples) {
        let random = 0.0;
        
        for (let i = 0; i < samples; i += 1) {
            random += Math.random();
        }
        
        return random / samples;
    }
    
    // Generate samples from a Weibull distribution.
    static WeibullSample(scale, shape, upperBound) {
        function WeibullCumulativeDistribution(scale, shape, variable) {
            return 1 - Math.exp(-Math.pow(variable / scale, shape));
        }
        
        // Limit the Weibull distribution to the interval [0, upperBound].
        const random = Math.random() * WeibullCumulativeDistribution(scale, shape, upperBound);
        
        // Take a sample from the Weibull distribution (from the inverse CDF)
        // and scale it to the interval [0, upperBound].
        return scale * Math.pow(-Math.log(1 - random), 1 / shape) / upperBound;
    }
    
    static RandomInteger(min, avg, max, distribution = 'Uniform') {
        const range = max - min;
        if (avg == null) {
            avg = (max + min) / 2;
        }
        
        let delta = 0;
        switch (distribution) {
            case 'Normal':
                delta = range * Utility.NormalSample(6);
                break;
            case 'Uniform':
                delta = range * Math.random();
                break;
            case 'Weibull':
                delta = range * Utility.WeibullSample(1, 2, 3);
                break;
            default:
                console.error(`Unknown distribution: ${distribution}`);
                break;
        }
        
        return min + Math.round(delta);
    }
    
    static FormatTimeString(time, digits) {
        if (Number.isInteger(time)) {
            return `${parseInt(time)}`;
        } else if (time < 1) {
            return `${time.toPrecision(digits)}`;
        } else {
            return `${time.toFixed(digits)}`;
        }
    }
    

    static TaskPorts(taskName, taskPorts) {
        return taskPorts.map(port => `${taskName}.${port}`);
    }

    static FormatTaskPorts(taskName, taskPorts) {
        return Utility.TaskPorts(taskName, taskPorts.sort()).join(', ');
    }
                             
    static GetTask(taskPort) {
        return taskPort.split('.')[0];
    }
                             
    static GetPort(taskPort) {
        return taskPort.split('.')[1];
    }
    
    static FormatDependencies(rawDependencies) {
        return rawDependencies.map(dependency => { 
            const sourceFullText = `${dependency.source.task}.${dependency.source.port}`;
        
            const sourceText = (dependency.source.task == Model.SystemInterfaceName)
                             ? `${dependency.source.port}`
                             : sourceFullText;

            const destinationFullText = `${dependency.destination.task}.${dependency.destination.port}`;

            const destinationText = (dependency.destination.task == Model.SystemInterfaceName)
                                  ? `${dependency.destination.port}`
                                  : destinationFullText;
        
            return {
                'name': dependency.name, 
                'source': sourceText,
                'sourceFull': sourceFullText,
                'destination': destinationText,
                'destinationFull': destinationFullText
            }
        });
    }
    
    static FormatDependencyString(dependency) {
        return  `[${dependency.name}]: ${dependency.source.task}.${dependency.source.port} -> ${dependency.destination.task}.${dependency.destination.port}`;
    }

    static FormatDependencyInstanceString(dependency) {
        return  `[${dependency.name}]: ${dependency.sendEvent.task}.${dependency.sendEvent.port}(${dependency.sendEvent.taskInstance}) -> ${dependency.receiveEvent.task}.${dependency.receiveEvent.port}(${dependency.receiveEvent.taskInstance})`;
    }
    
    static SimplifyChains(chains) {
        return chains.map(chain => {        
            return {
                'name': chain.name,
                'segments': chain.segments.map(segment => segment.name)
            };
        });
    }
    
    static AddDeleteButton(prefix, id) {
        return `<button id="${prefix}-${id}" type="submit" class="btn btn-danger btn-sm delete">Delete</button>`;
    }
    
    static CreateAccordionHeader(data, index) {
        return [
            `<h2 class="accordion-header">`,
            `    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">`,
            `        ${data}`,
            `    </button>`,
            `</h2>`
        ].join('\n');
    }

    static CreateAccordionBody(data, index) {
        return [
            `<div id="collapse${index}" class="accordion-collapse collapse" data-bs-parent="#analyse-model-body">`,
            `    <div class="accordion-body">`,
            `    ${data}`,
            `    </div>`,
            `</div>`
        ].join('\n');
    }
    
    static HasLocalStorage(type) {
        let storage;
        try {
            storage = window[type];
            const x = "__storage_test__";
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return (
                e instanceof DOMException &&
                // everything except Firefox
                (
                    e.code === 22 ||
                    // Firefox
                    e.code === 1014 ||
                    // test name field too, because code might not be present
                    // everything except Firefox
                    e.name === "QuotaExceededError" ||
                    // Firefox
                    e.name === "NS_ERROR_DOM_QUOTA_REACHED"
                ) &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage && storage.length !== 0
            );
        }
    }
    
    static LocalStorageGetSettings(viewName) {
        if (!Utility.HasLocalStorage('localStorage')) {
            return { };
        }
        
        return JSON.parse(localStorage.getItem(viewName));
    }
    
    static LocalStorageSetSettings(viewName, settings) {
        if (!Utility.HasLocalStorage('localStorage')) {
            return;
        }
        
        localStorage.setItem(viewName, JSON.stringify(settings));
    }

    // Sort the entities and entity instances such that all network delays appear before any task.
    static SortEntities(entities) {
        let sorted = [];

        // Group the netowrk delays together based on the receiver task.
        let tasks = entities.filter(entity => entity.type === 'task').sort();
        for (const task of tasks) {
            const encapsulationDelays = entities.filter(entity => entity.name.endsWith(`=> ${task.name} encapsulation delay`));
            sorted = [...sorted, ...encapsulationDelays];
            
            const networkDelays = entities.filter(entity => entity.name.endsWith(`=> ${task.name} network delay`));
            sorted = [...sorted, ...networkDelays];

            const decapsulationDelays = entities.filter(entity => entity.name.endsWith(`=> ${task.name} decapsulation delay`));
            sorted = [...sorted, ...decapsulationDelays];

            sorted.push(task);
        }

        return sorted;
    }
    
}

Utility.Interval = class {
    startTime = null;
    endTime = null;
    core = null;
    
    constructor(startTime, endTime, core) {
        this.startTime = parseInt(startTime);
        this.endTime = parseInt(endTime);
        this.core = core;
    
        if (this.startTime > this.endTime) {
            throw `Interval start time (${this.startTime}) is greater than its end time (${endTime})!`;
        }
    }
    
    static FromJson(json) {
        return new Utility.Interval(json.startTime, json.endTime, json.core);
    }
    
    get startTime() {
        return this.startTime;
    }
    
    set startTime(time) {
        this.startTime = parseInt(time);
    }
    
    get endTime() {
        return this.endTime;
    }
    
    set endTime(time) {
        this.endTime = parseInt(time);
    }
    
    get duration() {
        return this.endTime - this.startTime;
    }
    
    get core() {
        return this.core;
    }

    set core(core) {
        this.core = core
    }

    overlapsWith(other) {
        //                 |<--- this --->|
        // |<--- other --->|              |<--- other --->|
        return this.startTime < parseInt(other.endTime) && this.endTime > parseInt(other.startTime);
    }
    
    continuousWith(other) {
        //                 |<--- this --->|
        // |<--- other --->|              |<--- other --->|
        return this.startTime == parseInt(other.endTime) || this.endTime == parseInt(other.startTime);
    }
};

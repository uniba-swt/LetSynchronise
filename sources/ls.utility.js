'use strict'

class Utility {
    static get MsToNs() {
        return 1000000;
    }
    
    static ValidName(name) {
        return (/^([A-Za-z]|_)([A-Za-z0-9]|_)*$/).test(name);
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
    
    static RandomInteger(min, avg, max, distribution) {
        const range = max - min;
        
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
        }
        
        return min + Math.trunc(delta);
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
    
    static AddDeleteButton(id) {
        return `<button id="${id}" type="submit" class="btn btn-danger btn-sm delete">Delete</button>`;
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
    
    overlaps(other) {
        //                 |<--- this --->|
        // |<--- other --->|              |<--- other --->|
        return this.startTime < parseInt(other.endTime) && this.endTime > parseInt(other.startTime);
    }
};

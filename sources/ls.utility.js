'use strict'

class Utility {
    
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
                             

    static TaskPorts(taskName, taskPorts) {
        return taskPorts.map(port => `${taskName}.${port}`);
    }

    static FormatTaskPorts(taskName, taskPorts) {
        return Utility.TaskPorts(taskName, taskPorts).join(', ');
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

    static FormatConstraints(rawConstraints) {
        return rawConstraints.map(constraint => {
            const sourceFullText = `${constraint.source.task}.${constraint.source.port}`;

            const sourceText = (constraint.source.task == Model.SystemInterfaceName)
                             ? `${constraint.source.port}`
                             : sourceFullText;
                             
            const destinationFullText = `${constraint.destination.task}.${constraint.destination.port}`;

            const destinationText = (constraint.destination.task == Model.SystemInterfaceName)
                                  ? `${constraint.destination.port}`
                                  : destinationFullText;
                                  
            return {
                'name': constraint.name, 
                'source': sourceText,
                'sourceFull': sourceFullText,
                'destination': destinationText,
                'destinationFull': destinationFullText,
                'relation': constraint.relation,
                'time': constraint.time

            }
        });
    }
    
    static AddDeleteButton(id) {
        return `<button id="${id}" type="submit" class="btn btn-danger btn-sm delete">Delete</button>`;
    }
    
}

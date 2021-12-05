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
    
    static CreateAccordionHeader(parentElement, data) {
// 		<h2 class="accordion-header">
// 			<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1">
// 				Event chain
// 			</button>
// 		</h2>
    }

	static CreateAccordionBody(parentElement, data) {
// 		<div id="collapse1" class="accordion-collapse collapse" data-bs-parent="#analyse-model-body">
// 			<div class="accordion-body">
// 				<strong>This is the first item's accordion
// 				body.</strong> It is shown by default, until
// 				the collapse plugin adds the appropriate classes
// 				that we use to style each element. These
// 				classes control the overall appearance, as
// 				well as the showing and hiding via CSS
// 				transitions. You can modify any of this with
// 				custom CSS or overriding our default variables.
// 				It's also worth noting that just about any HTML
// 				can go within the <code>.accordion-body</code>, 
// 				though the transition does limit overflow.
// 				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
// 				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
// 				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
// 				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
// 				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
// 			</div>
// 		</div>
	}

    
}

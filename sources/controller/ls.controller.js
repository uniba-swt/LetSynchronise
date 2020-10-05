'use strict';

class Controller {
    controllerTask = null;
    controllerDependencies = null;
    controllerSchedule = null;

    constructor() { }
    
    toString() {
    	return ['Controller contains ...',
    	        `  ${this.controllerTask}, `,
                `  ${this.controllerDependencies}, and`,
                `  ${this.controllerSchedule}`].join('\n');
    }
    
}

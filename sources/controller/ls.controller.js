'use strict';

class Controller {
    controllerTask = null;
    controllerDependency = null;
    controllerSchedule = null;
    controllerConstraint = null;

    constructor() { }
    
    toString() {
    	return ['Controller contains ...',
    	        `  ${this.controllerTask}, `,
                `  ${this.controllerDependency}`,
                `  ${this.controllerSchedule}, and`,
                `  ${this.controllerConstraint}`].join('\n');
    }
    
}

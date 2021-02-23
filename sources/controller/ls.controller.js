'use strict';

class Controller {
    controllerTask = null;
    controllerDependencies = null;
    controllerSchedule = null;
    controllerConstraints = null;

    constructor() { }
    
    toString() {
    	return ['Controller contains ...',
    	        `  ${this.controllerTask}, `,
                `  ${this.controllerDependencies}`,
                `  ${this.controllerSchedule}, and`,
                `  ${this.controllerConstraints}`].join('\n');
    }
    
}

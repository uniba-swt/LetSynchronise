'use strict';

class Controller {
    controllerExportImport = null;
    controllerTask = null;
    controllerDependency = null;
    controllerSchedule = null;
    controllerConstraint = null;

    constructor() { }
    
    toString() {
        return ['Controller contains ...',
                `  ${this.controllerExportImport}, `,
                `  ${this.controllerTask}, `,
                `  ${this.controllerDependency}`,
                `  ${this.controllerSchedule}, and`,
                `  ${this.controllerConstraint}`].join('\n');
    }
    
}

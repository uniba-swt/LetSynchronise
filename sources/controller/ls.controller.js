'use strict';

class Controller {
    controllerExportImport = null;
    controllerInterface = null;
    controllerTask = null;
    controllerDependency = null;
    controllerSchedule = null;
    controllerConstraint = null;
    controllerEventChain = null;
    controllerAnalyse = null;

    constructor() { }
    
    toString() {
        return ['Controller contains ...',
                `  ${this.controllerExportImport}, `,
                `  ${this.controllerInterface}, `,
                `  ${this.controllerTask}, `,
                `  ${this.controllerDependency}, `,
                `  ${this.controllerSchedule}, `,
                `  ${this.controllerConstraint},`,
                `  ${this.controllerEventChain},`,
                `  ${this.controllerAnalyse}`].join('\n');
    }
    
}

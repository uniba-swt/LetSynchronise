'use strict';

class Controller {
    controllerExportImport = null;
    controllerCore = null;
    controllerMemory = null;
    controllerInterface = null;
    controllerTask = null;
    controllerDependency = null;
    controllerEventChain = null;
    controllerConstraint = null;
    controllerSchedule = null;
    controllerAnalyse = null;

    constructor() { }
    
    toString() {
        return ['Controller contains ...',
                `  ${this.controllerExportImport}, `,
                `  ${this.controllerCore}, `,
                `  ${this.controllerMemory}, `,
                `  ${this.controllerInterface}, `,
                `  ${this.controllerTask}, `,
                `  ${this.controllerDependency}, `,
                `  ${this.controllerEventChain},`,
                `  ${this.controllerConstraint},`,
                `  ${this.controllerSchedule}, `,
                `  ${this.controllerAnalyse}`].join('\n');
    }
    
}

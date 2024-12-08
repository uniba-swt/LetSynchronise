'use strict';

class Controller {
    controllerExportImport = null;
    controllerCore = null;
    controllerMemory = null;
    controllerInterface = null;
    controllerEntity = null;
    controllerDependency = null;
    controllerEventChain = null;
    controllerConstraint = null;
    controllerSchedule = null;
    controllerAnalyse = null;

    constructor() {
        // Restore navigation settings on page (re)load.
        window.addEventListener('load', (event) => {
            const settings = Utility.LocalStorageGetSettings('NavigationTab');
            if (settings != null) {
                const navigationTabs = d3.select('#nav-tab').selectAll('button');
                const tab = navigationTabs.filter(function (d) { return this.textContent == settings.tab; });
                if (!tab.empty()) {
                    tab.dispatch('click');
                }
            }
        });

        // Save navigation settings on page re/unload.
        window.addEventListener('unload', (event) => {
            const navigationTabs = d3.select('#nav-tab');
            const tab = navigationTabs.select('.active');
            const settings = { 'tab': tab.text() };
            Utility.LocalStorageSetSettings('NavigationTab', settings);
        });
    }
    
    toString() {
        return ['Controller contains ...',
                `  ${this.controllerExportImport}, `,
                `  ${this.controllerCore}, `,
                `  ${this.controllerMemory}, `,
                `  ${this.controllerInterface}, `,
                `  ${this.controllerEntity}, `,
                `  ${this.controllerDependency}, `,
                `  ${this.controllerEventChain},`,
                `  ${this.controllerConstraint},`,
                `  ${this.controllerSchedule}, `,
                `  ${this.controllerAnalyse}`].join('\n');
    }
    
}

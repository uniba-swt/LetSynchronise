'use strict';

class ViewExportImport {
    rootDesign = null;
    rootAnalyse = null;

    exportSystemButton = null;
    importSystemButton = null;
    resetSystemButton = null;
    
    importSystemSelector = null;
    importerSystemDropdown = null;
    
    exportScheduleButton = null;
    importScheduleButton = null;
    
    importScheduleSelector = null;


    constructor() {
        this.rootDesign = document.querySelector('#nav-design');
        this.rootAnalyse = document.querySelector('#nav-analyse');

        // System export or import.
        this.exportSystemButton = this.rootDesign.querySelector('#export-system');
        this.importSystemButton = this.rootDesign.querySelector('#import-system');
        this.resetSystemButton = this.rootDesign.querySelector('#reset-system');

        this.importSystemSelector = this.rootDesign.querySelector('#import-system-file');
        this.importerSystemDropdown = d3.select('#import-system-importers');
        
        // Schedule import.
        this.exportScheduleButton = this.rootAnalyse.querySelector('#export-schedule');
        this.importScheduleButton = this.rootAnalyse.querySelector('#import-schedule');

        this.importScheduleSelector = this.rootAnalyse.querySelector('#import-schedule-file');
        
        // Listeners
        this.setupImportSystemSelectorListener();
    }
    
    
    get importer() {
        const element = this.importerSystemDropdown.select('.active');
        return (element.node() != null) ? element.node().text : null;
    }
    
    
    // -----------------------------------------------------
    // Setup listeners
    
    setupImportSystemSelectorListener() {
        this.importSystemSelector.addEventListener('click', event => {
            // Filter the acceptable file types based on the selected plugin.
            const pluginImporter = PluginImporter.GetPlugin(this.importer);
            this.importSystemSelector.accept = `.${pluginImporter.Input}`;
        });
    }
    
    
    // -----------------------------------------------------
    // Registration of handlers from the controller
    
    registerExportSystemButtonHandler(handler) {
        this.exportSystemButton.addEventListener('click', event => {
            event.preventDefault();
            
            this.importSystemSelector.value = null;
        
            handler();
        });
    }

    registerImportSystemButtonHandler(handler) {
        this.importSystemButton.addEventListener('click', event => {
            event.preventDefault();
            
            const pluginImporter = PluginImporter.GetPlugin(this.importer);
            if (this.importSystemSelector.files.length < 1) {
                alert(`${pluginImporter.Name} system importer requires a *.${pluginImporter.Input.toLowerCase()} file to be selected!`);
                return;
            }
        
            const fileReader = new FileReader();
            fileReader.readAsText(this.importSystemSelector.files.item(0));
        
            fileReader.onload = (event) => {
                const result = pluginImporter.Result(event.target.result);
                handler(result);
            }
        });
    }

    registerResetSystemButtonHandler(handler) {
        this.resetSystemButton.addEventListener('click', event => {
            event.preventDefault();
            handler();
        });
    }

    registerExportScheduleButtonHandler(handler) {
        this.exportScheduleButton.addEventListener('click', event => {
            event.preventDefault();
            
            this.importScheduleSelector.value = null;
            
            handler();
        });
    }
    
    registerImportScheduleButtonHandler(handler) {
        this.importScheduleButton.addEventListener('click', event => {
            event.preventDefault();
            
            const pluginImporter = PluginImporter.GetPlugin('LetSynchronise');
            if (this.importScheduleSelector.files.length < 1) {
                alert(`${pluginImporter.Name} schedule importer requires a *.${pluginImporter.Input.toLowerCase()} file to be selected!`);
                return;
            }
            
            const fileReader = new FileReader();
            fileReader.readAsText(this.importScheduleSelector.files.item(0));
            
            fileReader.onload = (event) => {
                const result = pluginImporter.Result(event.target.result);
                handler(result);
            }
        });
    }
    
    
    updateSystemImporters() {
        const thisRef = this;
        
        // Choose one of the native plugins as the default importer.
        const nativePlugins = PluginImporter.OfCategory(PluginImporter.Category.Native);
        const nativePlugin = Object.keys(nativePlugins).length > 0 ? Object.keys(nativePlugins)[0] : null;
        const remainingPlugins = Object.keys(PluginImporter.Plugins);
        
        this.importerSystemDropdown.selectAll('*').remove();
        this.importerSystemDropdown
            .append('a')
                .attr('class', 'dropdown-item active')
                .text(nativePlugin)
            .on('click', function(event, data) {
                thisRef.importerSystemDropdown.node().querySelectorAll('a')
                    .forEach(importer => importer.classList.remove('active'));
                this.classList.add('active');
            });
        
        this.importerSystemDropdown
            .selectAll('a')
            .data(remainingPlugins)
            .enter()
            .append('a')
                .attr('class', 'dropdown-item')
                .text(remainingPlugin => remainingPlugin)
            .on('click', function(event, data) {
                thisRef.importerSystemDropdown.node().querySelectorAll('a')
                    .forEach(importer => importer.classList.remove('active'));
                this.classList.add('active');
            });
    }
    
    toString() {
        return "ViewExportImport";
    }
}

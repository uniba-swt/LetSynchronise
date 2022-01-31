'use strict';

class ViewExportImport {
    root = null;

    exportButton = null;
    importButton = null;
    resetButton = null;
    
    importSelector = null;
    importersDropdown = null;


    constructor() {
        this.root = document.querySelector('#nav-design');

        // System export or import
        this.exportButton = this.root.querySelector('#export-system');
        this.importButton = this.root.querySelector('#import-system');
        this.resetButton = this.root.querySelector('#reset-system');

        this.importSelector = this.root.querySelector('#import-system-file');
        this.importersDropdown = d3.select('#import-importers');
        
        // Listeners
        this.setupImportSelectorListener();
    }
    
    
    get importer() {
        const element = this.importersDropdown.select('.active');
        return (element.node() != null) ? element.node().text : null;
    }
    
    
    // -----------------------------------------------------
    // Setup listeners
    
    setupImportSelectorListener() {
        this.importSelector.addEventListener('click', event => {
            // Filter the acceptable file types based on the selected plugin.
            const pluginImporter = PluginImporter.GetPlugin(this.importer);
            this.importSelector.accept = `.${pluginImporter.Input}`;
        });
    }
    
    
    // -----------------------------------------------------
    // Registration of handlers from the controller
    
    registerExportButtonHandler(handler) {
        this.exportButton.addEventListener('click', event => {
            event.preventDefault();
            
            this.importSelector.value = null;
        
            handler();
        });
    }

    registerImportButtonHandler(handler) {
        this.importButton.addEventListener('click', event => {
            event.preventDefault();
            
            const pluginImporter = PluginImporter.GetPlugin(this.importer);
            if (this.importSelector.files.length < 1) {
                alert(`${pluginImporter.Name} system importer requires a *.${pluginImporter.Input.toLowerCase()} file to be selected!`);
                return;
            }
        
            const fileReader = new FileReader();
            fileReader.readAsText(this.importSelector.files.item(0));
        
            fileReader.onload = (event) => {
                const result = pluginImporter.Result(event.target.result);
                handler(result);
            }
        });
    }

    registerResetButtonHandler(handler) {
        this.resetButton.addEventListener('click', event => {
            event.preventDefault();
            handler();
        });
    }
    
    updateImporters() {
        const thisRef = this;
        
        // Choose one of the native plugins as the default importer.
        const nativePlugins = PluginImporter.OfCategory(PluginImporter.Category.Native);
        const nativePlugin = Object.keys(nativePlugins).length > 0 ? Object.keys(nativePlugins)[0] : null;
        const remainingPlugins = Object.keys(PluginImporter.Plugins);
        
        this.importersDropdown.selectAll('*').remove();
        this.importersDropdown
            .append('a')
                .attr('class', 'dropdown-item active')
                .text(nativePlugin)
            .on('click', function(event, data) {
                thisRef.importersDropdown.node().querySelectorAll('a')
                    .forEach(importer => importer.classList.remove('active'));
                this.classList.add('active');
            });
        
        this.importersDropdown
            .selectAll('a')
            .data(remainingPlugins)
            .enter()
            .append('a')
                .attr('class', 'dropdown-item')
                .text(remainingPlugin => remainingPlugin)
            .on('click', function(event, data) {
                thisRef.importersDropdown.node().querySelectorAll('a')
                    .forEach(importer => importer.classList.remove('active'));
                this.classList.add('active');
            });
    }
    
    toString() {
        return "ViewExportImport";
    }
}

'use strict';

class ViewExportImport {
    root = null;
    
    platformCheckbox = null;
    inputsOutputsCheckbox = null;
    tasksCheckbox = null;
    dependenciesCheckbox = null;
    scheduleCheckbox = null;
    eventChainsCheckbox = null;
    constraintsCheckbox = null;

    exportSystemButton = null;
    importSystemButton = null;
    resetSystemButton = null;
    
    importSystemSelector = null;
    importerSystemDropdown = null;
    

    constructor() {
        this.root = document.querySelector('#nav-management');
        
        // System elements to consider for export or import.
        this.platformCheckbox = this.root.querySelector('#exportimport-platform');
        this.inputsOutputsCheckbox = this.root.querySelector('#exportimport-inputs-outputs');
        this.tasksCheckbox = this.root.querySelector('#exportimport-tasks');
        this.dependenciesCheckbox = this.root.querySelector('#exportimport-dependencies');
        this.scheduleCheckbox = this.root.querySelector('#exportimport-schedule');
        this.eventChainsCheckbox = this.root.querySelector('#exportimport-event-chains');
        this.constraintsCheckbox = this.root.querySelector('#exportimport-constraints');
                
        // System export or import.
        this.exportSystemButton = this.root.querySelector('#export-system');
        this.importSystemButton = this.root.querySelector('#import-system');
        this.resetSystemButton = this.root.querySelector('#reset-system');

        this.importSystemSelector = this.root.querySelector('#import-system-file');
        this.importerSystemDropdown = d3.select('#import-system-importers');
        
        // Listeners
        this.setupImportSystemSelectorListener();
    }
    
    set platformChecked(isChecked) {
        this.platformCheckbox.checked = isChecked;
    }
    
    get platformChecked() {
        return this.platformCheckbox.checked;
    }
    
    set inputsOutputsChecked(isChecked) {
        this.inputsOutputsCheckbox.checked = isChecked;
    }
    
    get inputsOutputsChecked() {
        return this.inputsOutputsCheckbox.checked;
    }
    
    set tasksChecked(isChecked) {
        this.tasksCheckbox.checked = isChecked;
    }
    
    get tasksChecked() {
        return this.tasksCheckbox.checked;
    }
    
    set dependenciesChecked(isChecked) {
        this.dependenciesCheckbox.checked = isChecked;
    }
    
    get dependenciesChecked() {
        return this.dependenciesCheckbox.checked;
    }
    
    set scheduleChecked(isChecked) {
        this.scheduleCheckbox.checked = isChecked;
    }
    
    get scheduleChecked() {
        return this.scheduleCheckbox.checked;
    }
    
    set eventChainsChecked(isChecked) {
        this.eventChainsCheckbox.checked = isChecked;
    }
    
    get eventChainsChecked() {
        return this.eventChainsCheckbox.checked;
    }
    
    set constraintsChecked(isChecked) {
        this.constraintsCheckbox.checked = isChecked;
    }
    
    get constraintsChecked() {
        return this.constraintsCheckbox.checked;
    }
    
    get elementsSelected() {
        let keys = [];
        
        if (this.platformChecked) {
            keys.push('cores');
            keys.push('memories');
        }
        if (this.inputsOutputsChecked) {
            keys.push("inputs");
            keys.push("outputs");
        }
        if (this.tasksChecked) {
            keys.push("tasks");
        }
        if (this.dependenciesChecked) {
            keys.push("dependencies");
        }
        if (this.scheduleChecked) {
            keys.push("schedule");
        }
        if (this.eventChainsChecked) {
            keys.push("eventChains");
        }
        if (this.constraintsChecked) {
            keys.push("constraints");
        }
        
        return keys;
    }
    
    get importer() {
        const element = this.importerSystemDropdown.select('.active');
        return (element.node() != null) ? element.node().text : null;
    }
        
    set settings(settings) {
        if (settings.hasOwnProperty('platformChecked')) {
            this.platformChecked = settings.platformChecked;
        }
        
        if (settings.hasOwnProperty('inputsOutputsChecked')) {
            this.inputsOutputsChecked = settings.inputsOutputsChecked;
        }

        if (settings.hasOwnProperty('tasksChecked')) {
            this.tasksChecked = settings.tasksChecked;
        }

        if (settings.hasOwnProperty('dependenciesChecked')) {
            this.dependenciesChecked = settings.dependenciesChecked;
        }

        if (settings.hasOwnProperty('scheduleChecked')) {
            this.scheduleChecked = settings.scheduleChecked;
        }
        
        if (settings.hasOwnProperty('eventChainsChecked')) {
            this.eventChainsChecked = settings.eventChainsChecked;
        }

        if (settings.hasOwnProperty('constraintsChecked')) {
            this.constraintsChecked = settings.constraintsChecked;
        }
    }
    
    get settings() {
        return {
            'platformChecked'      : this.platformChecked,
            'inputsOutputsChecked' : this.inputsOutputsChecked,
            'tasksChecked'         : this.tasksChecked,
            'dependenciesChecked'  : this.dependenciesChecked,
            'scheduleChecked'      : this.scheduleChecked,
            'eventChainsChecked'   : this.eventChainsChecked,
            'constraintsChecked'   : this.constraintsChecked
        };
    }
    
    
    // -----------------------------------------------------
    // Setup listeners
    
    setupImportSystemSelectorListener() {
        this.importSystemSelector.addEventListener('click', event => {
            // Filter the acceptable file types based on the selected plugin.
            const pluginImporter = Plugin.GetPlugin(Plugin.Type.Importer, this.importer);
            this.importSystemSelector.accept = `.${pluginImporter.Input}`;
        });
    }
    
    
    // -----------------------------------------------------
    // Registration of handlers from the controller
    
    registerExportSystemButtonHandler(handler) {
        this.exportSystemButton.addEventListener('click', event => {
            event.preventDefault();
            
            this.importSystemSelector.value = null;

            handler(this.elementsSelected, PluginExporterNative);
        });
    }

    registerImportSystemButtonHandler(handler) {
        this.importSystemButton.addEventListener('click', event => {
            event.preventDefault();
            
            const pluginImporter = Plugin.GetPlugin(Plugin.Type.Importer, this.importer);
            if (this.importSystemSelector.files.length < 1) {
                alert(`${pluginImporter.Name} system importer requires a *.${pluginImporter.Input.toLowerCase()} file to be selected!`);
                return;
            }
        
            const fileReader = new FileReader();
            fileReader.readAsText(this.importSystemSelector.files.item(0));
        
            fileReader.onload = (event) => {
                pluginImporter.Result(event.target.result).then(result => handler(result, this.elementsSelected));
            }
        });
    }

    registerResetSystemButtonHandler(handler) {
        this.resetSystemButton.addEventListener('click', event => {
            event.preventDefault();
            handler(this.elementsSelected);
        });
    }   
    
    updateSystemImporters() {
        const thisRef = this;
        
        // Choose one of the native plugins as the default importer.
        const nativePlugins = Plugin.OfTypeAndCategory(Plugin.Type.Importer, Plugin.Category.Native);
        const nativePlugin = Object.keys(nativePlugins).length > 0 ? Object.keys(nativePlugins)[0] : null;
        const remainingPlugins = Object.keys(Plugin.OfType(Plugin.Type.Importer));
        
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

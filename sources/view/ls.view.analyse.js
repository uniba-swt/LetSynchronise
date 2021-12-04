'use strict';

class ViewAnalyse {
    root = null;
    
    analyseButton = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-analyse'); 
        
        // Analyse the static schedule
        this.analyseButton = this.root.querySelector('#analyse');
    }


    // -----------------------------------------------------
    // Registration of handlers from the controller

    registerAnalyseHandler(hander) {
        this.analyseButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            hander();
        });
    }

    async updateAnalyse(promise) {
        const results = await promise;
        
        
        for (const chainName in results) {
            let output = [`Event Chain: ${chainName}`, ``];
            for (const pluginName in results[chainName]) {
                const metrics = results[chainName][pluginName]['metrics'];
                const constraints = results[chainName][pluginName]['constraints'];
                const plugin = PluginMetric.getPlugin(pluginName);
                
                output.push(plugin.toString(metrics));
                for (const constraintName in constraints) {
                    output.push(this.formatConstraintResults(constraintName, constraints[constraintName]));
                }
                output.push('');
            }
            
            console.log(output.join('\n'));
        }
    }
    
    formatConstraintResults(name, results) {
        let output = Object.keys(results).map(chainInstance => `${this.getChainInstance(chainInstance)}: ${results[chainInstance]}`).join(', ');
    
        return `  ${name}: [${output}]`;
    }
    
    getChainInstance(name) {
        return parseInt(name.split('-')[1]);
    }

    toString() {
        return "ViewAnalyse";
    }
    
}
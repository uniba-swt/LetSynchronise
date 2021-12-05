'use strict';

class ViewAnalyse {
    root = null;
    
    analyseButton = null;
    
    analyseModalBody = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-analyse'); 
        
        // Analyse the static schedule
        this.analyseButton = this.root.querySelector('#analyse');
        
        this.analyseModalBody = d3.select('#analyse-modal-body');
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
        
        this.analyseModalBody.selectAll('*').remove();
        
        let output = [ ];
        for (const chainName in results) {
            output.push(`Event Chain: ${chainName}`, ``);
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
        }
        
        this.analyseModalBody
            .selectAll('div')
            .data([output.join('<br/>')])
            .enter()
            .append('div')
                .html(data => `${data}`);
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

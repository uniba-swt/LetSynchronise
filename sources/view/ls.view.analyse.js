'use strict';

class ViewAnalyse {
    root = null;
    
    analyseButton = null;
    analyseCloseButton = null;
    
    analyseModalBody = null;
    
    
    constructor() {
        this.root = document.querySelector('#nav-analyse'); 
        
        // Analyse the static schedule
        this.analyseButton = this.root.querySelector('#analyse');
        this.analyseCloseButton = this.root.querySelector('#analyseClose');
        
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

    registerAnalyseCloseHandler(hander) {
        this.analyseCloseButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            hander();
        });
    }
    
    clearAnalyseModal() {
        this.analyseModalBody.selectAll('*').remove();
        
        this.analyseModalBody
            .append('div')
                .attr('class', 'alert alert-danger')
                .attr('role', 'alert')
                .html('No analysis results!');
    }

    async updateAnalyse(promise) {
        const results = await promise;
        
        if (Object.keys(results).length == 0) {
            return;
        }
        
        this.analyseModalBody.selectAll('*').remove();
        
        let accordionItems = [ ];
        let index = 0;
        for (const chainName in results) {
            index++;
        
            let accordionBody = [ ];
            for (const pluginName in results[chainName]) {
                const metrics = results[chainName][pluginName]['metrics'];
                const constraints = results[chainName][pluginName]['constraints'];
                const plugin = Plugin.GetPlugin(Plugin.Type.Metric, pluginName);
                
                accordionBody.push([plugin.ToHtml(metrics) + this.constraintResultsToHtml(constraints)]);
            }

            let accordionItem = [
                Utility.CreateAccordionHeader(`Event Chain: ${chainName}`, index),
                Utility.CreateAccordionBody(accordionBody.join('<hr/>'), index)
            ].join('\n');
            
            accordionItems.push(accordionItem);
        }
        
        this.analyseModalBody
            .selectAll('div')
            .data(accordionItems)
            .enter()
            .append('div')
                .attr('class', 'accordion-item')
                .html(data => `${data}`);
    }
    
    constraintResultsToHtml(constraints) {
        let output = ['<ul>'];
        for (const constraintName in constraints) {
            if (Object.keys(constraints[constraintName]).length == 0) {
                continue;
            }
            
            let result = Object.keys(constraints[constraintName])
                               .map(chainInstance => `${this.getChainInstance(chainInstance)}: ${constraints[constraintName][chainInstance]}`);

            output.push(`<li>${constraintName}: [${result.join(', ')}]</li>`);
        }
        output.push('</ul>')
        
        return output.join('\n');
    }
    
    getChainInstance(name) {
        return parseInt(name.split('-')[1]);
    }

    toString() {
        return "ViewAnalyse";
    }
    
}

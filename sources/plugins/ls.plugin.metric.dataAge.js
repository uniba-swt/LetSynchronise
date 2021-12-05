'use strict';

class PluginMetricDataAge {
    // Plug-in Metadata
    static get Name()     { return 'Data Age'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginMetric.Category.Timing; }
    static get Input()    { return PluginMetric.Input.ChainInstances; }
    static get Output()   { return PluginMetric.Output.DataAges; }
    
    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns an object containing results of the analysis, e.g., 
    // min, avg, max values, and number of values.
    //
    // @Input event chain name, array of event chain instances.
    // @Output object with statistical result of metric.
    static Result(chainName, chainInstances) {
        let rawResults = { };
        let statistics = { };
        
        chainInstances.forEach(chainInstance => PluginMetricDataAge.Compute(chainInstance, rawResults));
        
        for (chainName in rawResults) {
            const valuesOnly = PluginMetric.ValuesOfObject(rawResults[chainName]);

            statistics[chainName] = {
                'chainName': chainName,
                'min': PluginMetric.Min(valuesOnly),
                'avg': PluginMetric.Avg(valuesOnly),
                'max': PluginMetric.Max(valuesOnly),
                'num': valuesOnly.length,
                'raw': rawResults[chainName]
            };
        }
        
        return statistics;
    }
    
    // Compute the data ages along one event chain instance.
    static Compute(chainInstance, rawResults) {        
        let nextSegment = chainInstance.generator();
        for (const segment of nextSegment) {
            const startTime = segment.sendEvent.timestamp;
            const endTime = segment.receiveEvent.timestamp;
    
            if (!rawResults.hasOwnProperty(segment.name)) {
                rawResults[segment.name] = { };
            }
            rawResults[segment.name][chainInstance.name] = endTime - startTime; 
        }
        
        return rawResults;
    }
    
    static ToHtml(result) {
        let output = [`<h6>${PluginMetricDataAge.Name}: ${Object.keys(result).length} dependencies</h6>`];
        
        for (const chainName in result) {
            output.push(
                `${chainName}: (min, avg, max) = (${result[chainName].min}, ${result[chainName].avg}, ${result[chainName].max})`,
                `<ul><li>${result[chainName].num} values: [${PluginMetric.ValuesOfObject(result[chainName].raw).join(', ')}]</li></ul>`
            );
        }
        
        return output.join('\n');
    }

    static ToString(result) {
        let output = [`${PluginMetricDataAge.Name}: ${Object.keys(result).length} dependencies`];
        
        for (const chainName in result) {
            output.push(
                `  ${chainName}: (min, avg, max) = (${result[chainName].min}, ${result[chainName].avg}, ${result[chainName].max})`,
                `    ${result[chainName].num} values: [${PluginMetric.ValuesOfObject(result[chainName].raw).join(', ')}]`,
            );
        }
        
        return output.join('\n');
    }
    
}

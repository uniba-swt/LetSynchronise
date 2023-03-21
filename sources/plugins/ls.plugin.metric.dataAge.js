'use strict';

class PluginMetricDataAge {
    // Plug-in Metadata
    static get Name()     { return 'Data Age'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Type()     { return Plugin.Type.Metric; }
    static get Category() { return Plugin.Category.Timing; }
    static get Input()    { return Plugin.Input.ChainInstances; }
    static get Output()   { return Plugin.Output.DataAges; }
    
    
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
        
        chainInstances.forEach(chainInstance => this.Compute(chainInstance, rawResults));
        
        for (const segmentName in rawResults) {
            const valuesOnly = Plugin.ValuesOfObject(rawResults[segmentName]);

            statistics[segmentName] = {
                'segmentName': segmentName,
                'min': Plugin.Min(valuesOnly),
                'avg': Plugin.Avg(valuesOnly),
                'max': Plugin.Max(valuesOnly),
                'num': valuesOnly.length,
                'raw': rawResults[segmentName]
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
            rawResults[segment.name][segment.instance] = endTime - startTime; 
        }
        
        return rawResults;
    }
    
    static ToHtml(result) {
        let output = [`<h6>${PluginMetricDataAge.Name}: ${Object.keys(result).length} dependencies</h6>`];
        
        for (const segmentName in result) {
            const values = Plugin.ValuesOfObject(result[segmentName].raw).map(value => value / Utility.MsToNs);
            output.push(
                `${segmentName}: (min, avg, max) = (${result[segmentName].min / Utility.MsToNs}, ${result[segmentName].avg / Utility.MsToNs}, ${result[segmentName].max / Utility.MsToNs})ms`,
                `<ul><li>${result[segmentName].num} values: [${values.join(', ')}]</li></ul>`
            );
        }
        
        return output.join('\n');
    }

    static ToString(result) {
        let output = [`${PluginMetricDataAge.Name}: ${Object.keys(result).length} dependencies`];
        
        for (const segmentName in result) {
            const values = Plugin.ValuesOfObject(result[segmentName].raw).map(value => value / Utility.MsToNs);
            output.push(
                `  ${segmentName}: (min, avg, max) = (${result[segmentName].min / Utility.MsToNs}, ${result[segmentName].avg / Utility.MsToNs}, ${result[segmentName].max / Utility.MsToNs})ms`,
                `    ${result[segmentName].num} values: [${values.join(', ')}]`,
            );
        }
        
        return output.join('\n');
    }
    
}

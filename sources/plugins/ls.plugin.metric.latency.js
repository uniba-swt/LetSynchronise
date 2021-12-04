'use strict';

class PluginMetricLatency {
    // Plug-in Metadata
    static get Name()     { return 'Latency'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return PluginMetric.Category.Timing; }
    static get Input()    { return PluginMetric.Input.ChainInstances; }
    static get Output()   { return PluginMetric.Output.Latencies; }

    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns an object containing results of the analysis, e.g., 
    // min, avg, max values, and number of values.
    //
    // @Input event chain name, array of event chain instances.
    // @Output object with statistical result of metric.
    static result(chainName, chainInstances) {
        const rawResults = Object.fromEntries(chainInstances.map(chainInstance => PluginMetricLatency.compute(chainInstance)));
        const valuesOnly = PluginMetric.valuesOfObject(rawResults);
        
        return {
            'chainName': chainName,
            'min': PluginMetric.min(valuesOnly),
            'avg': PluginMetric.avg(valuesOnly),
            'max': PluginMetric.max(valuesOnly),
            'num': valuesOnly.length,
            'raw': rawResults
        }
    }
    
    // Compute the latency of one event chain instance.
    static compute(chainInstance) {
        const startTime = chainInstance.segment.sendEvent.timestamp;
        const endTime = chainInstance.last.segment.receiveEvent.timestamp;
    
        return [chainInstance.name, endTime - startTime];
    }
    
    static toString(result) {
        if (result == { }) {
            return `${PluginMetricLatency.Name}: ${result.num} values`;
        } else {
            return [
                `${PluginMetricLatency.Name}: (min, avg, max) = (${result.min}, ${result.avg}, ${result.max})`,
                `  ${result.num} values: [${PluginMetric.valuesOfObject(result.raw).join(', ')}]`
            ].join('\n');
        }
    }
}
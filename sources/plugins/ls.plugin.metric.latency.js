'use strict';

class PluginMetricLatency {
    // Plug-in Metadata
    static get Name()     { return 'Latency'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Type()     { return Plugin.Type.Metric; }
    static get Category() { return Plugin.Category.Timing; }
    static get Input()    { return Plugin.Input.ChainInstances; }
    static get Output()   { return Plugin.Output.Latencies; }

    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns an object containing results of the analysis, e.g., 
    // min, avg, max values, and number of values.
    //
    // @Input event chain name, array of event chain instances.
    // @Output object with statistical result of metric.
    static Result(chainName, chainInstances) {
        const rawResults = Object.fromEntries(chainInstances.map(chainInstance => this.Compute(chainInstance)));
        const valuesOnly = Plugin.ValuesOfObject(rawResults);
        
        return {
            'chainName': chainName,
            'min': Plugin.Min(valuesOnly),
            'avg': Plugin.Avg(valuesOnly),
            'max': Plugin.Max(valuesOnly),
            'num': valuesOnly.length,
            'raw': rawResults
        }
    }
    
    // Compute the latency of one event chain instance.
    static Compute(chainInstance) {
        const startTime = chainInstance.segment.sendEvent.timestamp;
        const endTime = chainInstance.last.segment.receiveEvent.timestamp;
    
        return [chainInstance.name, endTime - startTime];
    }
    
    static ToHtml(result) {
        if (result == { }) {
            return `<h6>${PluginMetricLatency.Name}: ${result.num} values</h6>`;
        } else {
            const values = Plugin.ValuesOfObject(result.raw).map(value => value / Utility.MsToNs);
            return [
                `<h6>${PluginMetricLatency.Name}: (min, avg, max) = (${result.min / Utility.MsToNs}, ${result.avg / Utility.MsToNs}, ${result.max / Utility.MsToNs})ms</h6>`,
                `<ul><li>${result.num} values: [${values.join(', ')}]</li></ul>`,
            ].join('\n');
        }
    }
    
    static ToString(result) {
        if (result == { }) {
            return `${PluginMetricLatency.Name}: ${result.num} values`;
        } else {
            const values = Plugin.ValuesOfObject(result.raw).map(value => value / Utility.MsToNs);
            return [
                `${PluginMetricLatency.Name}: (min, avg, max) = (${result.min / Utility.MsToNs}, ${result.avg / Utility.MsToNs}, ${result.max / Utility.MsToNs})ms`,
                `  ${result.num} values: [${values.join(', ')}]`
            ].join('\n');
        }
    }
    
}

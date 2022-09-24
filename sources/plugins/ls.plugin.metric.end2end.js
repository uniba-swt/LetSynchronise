'use strict';

class PluginMetricEnd2End {
    // Plug-in Metadata
    static get Name()     { return 'End-to-End Response Time'; }
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
    static Result(chainName, chainInstances) {
        let rawResults = Object.fromEntries(chainInstances.map(chainInstance => this.Compute(chainInstance))
                                                          .filter(result => result !== undefined));        
        const valuesOnly = PluginMetric.ValuesOfObject(rawResults);
        
        return {
            'chainName': chainName,
            'min': PluginMetric.Min(valuesOnly),
            'avg': PluginMetric.Avg(valuesOnly),
            'max': PluginMetric.Max(valuesOnly),
            'num': valuesOnly.length,
            'raw': rawResults
        }
    }

    // Compute the end-to-end response time of one event chain instance.
    static Compute(chainInstance) {
        if (chainInstance.segment.sendEvent.task == Model.SystemInterfaceName
                && chainInstance.last.segment.receiveEvent.task == Model.SystemInterfaceName) {
            const startTime = chainInstance.segment.sendEvent.timestamp;
            const endTime = chainInstance.last.segment.receiveEvent.timestamp;
    
            return [chainInstance.name, endTime - startTime];
        }
        
        return undefined;
    }

	static ToHtml(result) {
        if (result.num == 0) {
            return `<h6>${PluginMetricEnd2End.Name}: ${result.num} values</h6>`;
        } else {
            return [
                `<h6>${PluginMetricEnd2End.Name}: (min, avg, max) = (${result.min}, ${result.avg}, ${result.max})</h6>`,
                `<ul><li>${result.num} values: [${PluginMetric.ValuesOfObject(result.raw).join(', ')}]</li></ul>`,
            ].join('\n');
        }
	}

    static ToString(result) {
        if (result.num == 0) {
            return `${PluginMetricEnd2End.Name}: ${result.num} values`;
        } else {
            return [
                `${PluginMetricEnd2End.Name}: (min, avg, max) = (${result.min}, ${result.avg}, ${result.max})`,
                `  ${result.num} values: [${PluginMetric.ValuesOfObject(result.raw).join(', ')}]`
            ].join('\n');
        }
    }
    
}

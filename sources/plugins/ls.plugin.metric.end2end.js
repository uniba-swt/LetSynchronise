'use strict';

class MetricEnd2End {
    // Plug-in Metadata
    static get Name()     { return 'End-to-End Response Time'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return Metric.Category.Timing; }
    static get Input()    { return Metric.Input.ChainInstances; }
    static get Output()   { return Metric.Output.Latencies; }
    
    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns an object containing results of the analysis, e.g., 
    // min, avg, max values, and number of values.
    //
    // @Input event chain name, array of event chain instances.
    // @Output object with statistical result of metric.
    static result(chainName, chainInstances) {
        let rawResults = chainInstances.map(chainInstance => MetricEnd2End.compute(chainInstance));
        rawResults = rawResults.filter(result => result !== undefined);
        
        return {
            'chainName': chainName,
            'min': (rawResults.length == 0) ? undefined : Math.min(...rawResults),
            'avg': (rawResults.length == 0) ? undefined : rawResults.reduce((a, b) => (a + b)) / rawResults.length,
            'max': (rawResults.length == 0) ? undefined : Math.max(...rawResults),
            'num': rawResults.length,
            'raw': rawResults
        }
    }

    // Compute the end-to-end response time of one event chain instance.
    static compute(chainInstance) {
        if (chainInstance.segment.sendEvent.task == Model.SystemInterfaceName
                && chainInstance.last.segment.receiveEvent.task == Model.SystemInterfaceName) {
            const startTime = chainInstance.segment.sendEvent.timestamp;
            const endTime = chainInstance.last.segment.receiveEvent.timestamp;
    
            return endTime - startTime;
        }
        
        return undefined;
    }
}
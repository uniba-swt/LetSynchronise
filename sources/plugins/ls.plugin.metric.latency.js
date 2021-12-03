'use strict';

class MetricLatency {
    // Plug-in Metadata
    static get Name()     { return 'Latency'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return 'EventChainInstance' };
    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns an object containing results of the analysis, e.g., 
    // min, avg, max values, and number of values.
    //
    // @Input event chain name, array of event chain instances
    // @Output object with statistical result of metric
    static result(chainName, chainInstances) {
        const rawResults = chainInstances.map(chainInstance => MetricLatency.latency(chainInstance));
        
        if (rawResults.length == 0) {
            return {
                'chainName': chainName,
                'min': undefined,
                'avg': undefined,
                'max': undefined,
                'num': 0,
                'raw': rawResults
            }
        } else {
            return {
                'chainName': chainName,
                'min': Math.min(...rawResults),
                'avg': rawResults.reduce((a, b) => (a + b)) / rawResults.length,
                'max': Math.max(...rawResults),
                'num': rawResults.length,
                'raw': rawResults
            }
        }
    }
    
    static latency(chainInstance) {
        const startTime = chainInstance.segment.sendEvent.timestamp;
        const endTime = chainInstance.last.segment.receiveEvent.timestamp;
    
        return endTime - startTime;
    }
}
'use strict';

class MetricDataAge {
    // Plug-in Metadata
    static get Name()     { return 'Data age'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return Metric.Category.Timing; }
    static get Input()    { return Metric.Input.ChainInstances; }
    static get Output()   { return Metric.Output.DataAges; }
    
    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns an object containing results of the analysis, e.g., 
    // min, avg, max values, and number of values.
    //
    // @Input event chain name, array of event chain instances.
    // @Output object with statistical result of metric.
    static result(chainName, chainInstances) {
        let rawResults = { };
        let statistics = { };
        
        chainInstances.forEach(chainInstance => MetricDataAge.compute(chainInstance, rawResults));
        
        for (chainName in rawResults) {
            statistics[chainName] = {
                'chainName': chainName,
                'min': (rawResults[chainName].length == 0) ? undefined : Math.min(...rawResults[chainName]),
                'avg': (rawResults[chainName].length == 0) ? undefined : rawResults[chainName].reduce((a, b) => (a + b)) / rawResults[chainName].length,
                'max': (rawResults[chainName].length == 0) ? undefined : Math.max(...rawResults[chainName]),
                'num': rawResults[chainName].length,
                'raw': rawResults[chainName]
            };
        }
        
        return statistics;
    }
    
    // Compute the data ages along one event chain instance.
    static compute(chainInstance, rawResults) {        
        let nextSegment = chainInstance.generator();
        for (const segment of nextSegment) {
            const startTime = segment.sendEvent.timestamp;
            const endTime = segment.receiveEvent.timestamp;
    
            if (!rawResults.hasOwnProperty(segment.name)) {
                rawResults[segment.name] = [ ];
            }
            rawResults[segment.name].push(endTime - startTime); 
        }
        
        return rawResults;
    }
}

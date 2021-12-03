'use strict';

class MetricDataAge {
    // Plug-in Metadata
    static get Name()     { return 'Data age'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Category() { return 'EventChainInstance' };
    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    static result(chainInstance) {
        let dataAges = [];
        
        let nextSegment = chainInstance.generator();
        for (const segment of nextSegment) {
            const startTime = segment.sendEvent.timestamp;
            const endTime = segment.receiveEvent.timestamp;
    
            dataAges.push(endTime - startTime); 
        }
        
        return dataAges;
    }
}
'use strict';

class MetricLatency {
    // Plug-in Metadata
    static get Name()     { return 'Latency'; }
    static get Author()   { 'Eugene Yip'; }
    static get Category() { 'EventChainInstance' };
    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    static result(chainInstance) {
        const startTime = chainInstance.segment.sendEvent.timestamp;
        const endTime = chainInstance.last.segment.receiveEvent.timestamp;
    
        return endTime - startTime;
    }
}
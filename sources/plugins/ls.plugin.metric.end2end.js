'use strict';

class MetricEnd2End {
    // Plug-in Metadata
    static get Name()   { return 'End-to-End Response Time'; }
    static get Author() { 'Eugene Yip'; }
    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    static result(chainInstance) {
        if (chainInstance.segment.sendEvent.task == Model.SystemInterfaceName
                && chainInstance.last.segment.receiveEvent.task == Model.SystemInterfaceName) {
            const startTime = chainInstance.segment.sendEvent.timestamp;
            const endTime = chainInstance.last.segment.receiveEvent.timestamp;
    
            return endTime - startTime;
        }
        
        return;    // Result is undefined
    }
}
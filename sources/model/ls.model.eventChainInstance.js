class EventChainInstance {
    segment = null;    // Dependency instance event
    successor = null;

    constructor(name, dependency) {
        this.segment = dependency;
        this.segment.name = name;
    }
    
    static FromJson(json) {
    	let eventChainInstance = new EventChainInstance(json.segment.name, json.segment);
    	if (json.successor) {
	    	eventChainInstance.successor = EventChainInstance.FromJson(json.successor);
    	}
    	
    	return eventChainInstance;
    }
    
    get copy() {
    	let copy = new EventChainInstance(this.segment.name, this.segment);
    	if (this.successor) {
	    	copy.successor = this.successor.copy;
    	}
    	
    	return copy;
    }
    
    get segment() {
        return this.segment;
    }
    
    get successor() {
        return this.successor;
    }
    
    set successor(eventChainInstance) {
        if (this.successor) {
            alert('EventChainInstance: Overwriting a successor!');
        }
        
        this.successor = eventChainInstance;
    }
    
    get last() {
    	if (!this.successor) {
    		return this;
    	}
    	
    	return this.successor.last;
    }
    
    get maxLatency() {
    	const startTime = this.segment.sendEvent.timestamp;
    	const endTime = this.last.segment.receiveEvent.timestamp;
    
    	return endTime - startTime;
    }
    
    // Generator function for visiting each segment in the event chain instance
	* generator () {
		yield this.segment;
		
		if (this.successor) {
			yield* this.successor.generator();
		}		
	}

    toString() {
        const output = Utility.FormatDependencyInstanceString(this.segment);
        if (!this.successor) {
            return output;
        } else {
            return `${output} -> ${this.successor.toString()}`;
        }
    }
}

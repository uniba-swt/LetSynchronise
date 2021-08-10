class EventChainInstance {
	name = null;
    segment = null;    // Dependency instance event
    successor = null;

    constructor(constraintName, dependency) {
    	this.name = constraintName;
        this.segment = dependency;
    }
    
    static FromJson(json) {
    	let eventChainInstance = new EventChainInstance(json.name, json.segment);
    	    	
    	if (json.successor) {
	    	eventChainInstance.successor = EventChainInstance.FromJson(json.successor);
    	}
    	
    	return eventChainInstance;
    }
    
    get json() {
    	let json = { segment: this.segment };
    	
    	if (this.name) {
    		json['name'] = this.name;
    	}
    	
    	if (this.successor) {
    		json['successor'] = this.successor.json;
    	}
    	
    	return json;
    }
    
    get copy() {
    	let copy = new EventChainInstance(this.name, this.segment);
    	
    	if (this.successor) {
	    	copy.successor = this.successor.copy;
    	}
    	
    	return copy;
    }
    
    get name() {
    	return this.name;
    }
    
    set name(name) {
    	this.name = name;
    }
    
    get constraintName() {
    	return this.name.split(':')[0];
    }
    
    get eventChainName() {
    	const nameComponents = this.name.split(':');
    	return `${nameComponents[0]}:${nameComponents[1]}`;
    }
    
    get variant() {
    	return parseInt(this.name.split(':')[1]);
    }
    
    get instance() {
    	return parseInt(this.name.split(':')[2]);
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

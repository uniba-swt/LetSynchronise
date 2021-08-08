class EventChain {
    dependency = null;
    children = null;

    constructor(dependency) {
		this.dependency = dependency;
		this.children = []; // adjacency list
    }
  
    addChild(eventChain) {
		this.children.push(eventChain);
    }

    addChildDependency(dependency) {
        let childNode = new EventChain(dependency)
        this.addChild(childNode);
        return childNode;
    }

    includes(eventChain) {
		if (this.dependency == eventChain.dependency) {
			return true;
		}
      
		for (const node of this.children) {
			if (node.includes(eventChain)) {
				return true;
			}
		}

		return false;
    }
    
    startsWith(source) {
    	return (this.dependency.source.task == source.task 
    	        && this.dependency.source.port == source.port);
    }
    
    buildCompleteChain(allDependencies, source, destination) {
    	
    }

    toString() {
        let output = "";
        output = output + Utility.FormatDependencyString(this.dependency);
        for (const node of this.children) {
            output = output + ` -> ${node.toString()}`;
        }
        return output;
    }
}
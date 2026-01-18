'use strict';

class Chain {
    name = null;
    segment = null;    // Dependency
    successor = null;

    constructor(dependency) {
        this.segment = dependency;
    }
    
    static FromJson(json) {
        let chain = new Chain(json.segment);
        
        chain.name = json.name;
        
        if (json.successor) {
            chain.successor = Chain.FromJson(json.successor);
        }
        
        return chain;
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
    
    get name() {
        return this.name;
    }
    
    set name(name) {
        this.name = name;
    }
    
    get segment() {
        return this.segment;
    }
    
    get segments() {
        let segments = [this.segment];
        
        if (this.successor) {
            segments.push(...this.successor.segments);
        }
        
        return segments;
    }
    
    get successor() {
        return this.successor;
    }
    
    set successor(chain) {
        if (this.successor) {
            alert('Chain: Overwriting a successor!');
        }
        
        this.successor = chain;
    }
    
    get last() {
        if (!this.successor) {
            return this;
        }
        
        return this.successor.last;
    }
    
    get sourceEntity() {
        return this.segment.source.entity;
    }
    
    // Generator function to visit each segment in the chain
    * generator() {
        yield this.segment;
        
        if (this.successor) {
            yield* this.successor.generator();
        }       
    }

    includes(dependency) {
        if (this.segment == dependency) {
            return true;
        } else if (this.successor == null) {
            return false;
        }
        
        return this.successor.includes(dependency);
    }
    
    startsWith(source) {
        return (this.segment.source.entity == source.entity
                && this.segment.source.port == source.port);
    }

    toString() {
        const output = Utility.FormatDependencyString(this.segment);
        if (!this.successor) {
            return output;
        } else {
            return `${output} -> ${this.successor.toString()}`;
        }
    }
}

'use strict';

class PluginImporterNative {
    // Plug-in Metadata
    static get Name()     { return 'LetSynchronise'; }
    static get Author()   { return 'Eugene Yip'; }
    static get Type()     { return Plugin.Type.Importer; }
    static get Category() { return Plugin.Category.Native; }
    static get Input()    { return Plugin.Input.Json; }
    static get Output()   { return Plugin.Output.Json; }

    
    // Plug-ins are like utility classes that cannot be instantiated.
    // All functions are static.
    
    // Returns an object representation of a given system.
    // If the system is not valid JSON, then null is returned.
    //
    // @Input system defined in native JSON format.
    // @Output system as a JavaScript object.
    static async Result(rawSystem) {
        // Try to parse the raw system JSON into an object.
        let system = null;
        try {
            system = JSON.parse(rawSystem);
        } catch (error) {
            alert(`File to import does not use valid JSON: \n\n${error.message}`);
            return null;
        }
            
        if (!this.ValidateEntityDependencies(system)) {
            return null;
        }
        
        if (!this.ValidateEventChains(system)) {
            return null;
        }
        
        if (!this.ValidateTimingConstraints(system)) {
            return null;
        }

        return system;
    }
    
    static ValidateEntityDependencies(system) {
        if (system[Model.DependencyStoreName] === undefined) {
            return true;
        }
        
        const dependencies = system[Model.DependencyStoreName];
        if (Object.keys(dependencies).length > 0
                && system[Model.SystemInputStoreName] === undefined 
                && system[Model.SystemOutputStoreName] === undefined 
                && system[Model.EntityStoreName] === undefined) {
            alert('File to import defines task dependencies but no input/output interfaces or tasks have been defined.');
            return false;
        }
        
        for (const dependency of dependencies) {            
            const validationResult = this.ValidateEntityDependency(dependency, system);
            if (typeof validationResult == "string") {
                alert(validationResult);
                return false;
            }
        }
        
        return true;
    }
    
    static ValidateEntityDependency(dependency, system) {
        if (dependency.name === undefined) {
            return `File to import has a task dependency with a missing name.`;
        }

        if (dependency.source.entity === undefined || dependency.source.port === undefined) {
            return `File to import has task dependency "${dependency.name}" with an undefined source port.`
        }
                
        if (dependency.destination.entity === undefined || dependency.destination.port === undefined) {
            return `File to import has task dependency "${dependency.name}" with an undefined destination port.`
        }
        
        const inputs = system[Model.SystemInputStoreName];
        const outputs = system[Model.SystemOutputStoreName];
        const entities = system[Model.EntityStoreName];
        if (dependency.source.entity == Model.SystemInterfaceName) {
            let systemInterface = inputs === undefined ? null : inputs.find(dependency.source.port);
            if (systemInterface === null) {
                return `File to import has task dependency "${dependency.name}" that uses a non-existent "${Model.SystemInterfaceName}.${dependency.source.port}" port.`
            }
         } else {
            let entity = entities.find(dependency.source.entity);
            if (entity === null || !entity.outputs.includes(dependency.source.port)) {
                return `File to import has task dependency "${dependency.name}" that uses a non-existent "${destination.source.entity}.${dependency.source.port}" port.`
            }
        }
        
        if (dependency.destination.entity == Model.SystemInterfaceName) {
            let systemInterface = outputs === undefined ? null : outputs.find(dependency.destination.port);
            if (systemInterface === null) {
                return `File to import has task dependency "${dependency.name}" that uses a non-existent "${Model.SystemInterfaceName}.${dependency.destination.port}" port.`
            }
         } else {
            let entity = entities.find(dependency.destination.entity);
            if (entity === null || !entity.inputs.includes(dependency.destination.port)) {
                return `File to import has task dependency "${dependency.name}" that uses a non-existent "${dependency.destination.entity}.${dependency.destination.port}" port.`
            }
         }
         
         return null;
    }
    
    static ValidateEventChains(system) {
        if (system[Model.EventChainStoreName] === undefined) {
            return true;
        }
        const eventChains = system[Model.EventChainStoreName];

        if (Object.keys(eventChains).length > 0 && system[Model.DependencyStoreName] === undefined) {
            alert('File to import defines event chains but no task dependencies have been defined.');
            return false;
        }
        
        for (const eventChain of eventChains) {
            const validationResult = this.ValidateEventChain(eventChain, system);
            if (typeof validationResult == "string") {
                alert(validationResult);
                return false;
            }
        }
        
        return true;
    }
    
    static ValidateEventChain(eventChain, system) {        
        if (eventChain.name === undefined) {
            return 'File to import has an event chain with a missing name.';
        }
        
        if (eventChain.segment === undefined) {
            return `File to import has event chain ${eventChain} that does not define a segment.`;
        }
        
        const dependencies = system[Model.DependencyStoreName];
        const validationResult = this.ValidateEventChainSegment(eventChain.name, eventChain, dependencies);
        if (typeof validationResult == "string") {
            return validationResult;
        }
        
        return true;
    }
    
    static ValidateEventChainSegment(eventChainName, successor, dependencies) {
        if (successor.segment === undefined) {
            return `File to import has event chain "${eventChainName}" with a successor that does not define a segment.`;
        }
      
        if (successor.segment.name === undefined) {
            return `File to import has event chain "${eventChainName}" with an unnamed segment.`;
        }

        // Check that the segment matches the originally defined dependency.
        const dependency = this.GetDependency(successor.segment.name, dependencies);
        if (JSON.stringify(successor.segment) != JSON.stringify(dependency)) {
            return `File to import has event chain "${eventChainName}" with segment "${successor.segment.name}" that differs from the original dependency.`;
        }
        
        // Recursively check the successor dependency.
        if (successor.successor !== undefined) {
            const validationResult = this.ValidateEventChainSegment(eventChainName, successor.successor, dependencies);
            if (typeof validationResult == "string") {
                return validationResult;
            }
        }
    }
    
    static GetDependency(dependencyName, dependencies) {
        for (const dependency of dependencies) {
            if (dependency.name == dependencyName) {
                return dependency;
            }
        }
        
        return null;
    }
    
    static ValidateTimingConstraints(system) {
        if (system[Model.ConstraintStoreName] === undefined) {
            return true;
        }
        const constraints = system[Model.ConstraintStoreName];
        
        if (Object.keys(constraints).length > 0 && system[Model.EventChainStoreName] === undefined) {
            alert('File to import defines constraints but no event chains have been defined.');
            return false;
        }
        
        for (const constraint of constraints) {
            const validationResult = this.ValidateConstraint(constraint, system);
            if (typeof validationResult == "string") {
                alert(validationResult);
                return false;
            }
        }
        
        return true;
    }
    
    static ValidateConstraint(constraint, system) {
        const dependencies = system[Model.DependencyStoreName];
        
        if (constraint.name === undefined) {
            return 'File to import has a constraint with a missing name.';
        }

        if (constraint.eventChain === undefined || constraint.relation === undefined || constraint.time === undefined) {
            return `File to import has constraint "${constraint.name}" that has a missing event chain, relation, or time.`;
        }
        
        const eventChains = system[Model.EventChainStoreName];
        const eventChain = this.GetEventChain(constraint.eventChain, eventChains);
        if (eventChain === null) {
            return `File to import has constraint "${constraint.name}" that uses a non-existent "${constraint.eventChain}" event chain.`;
        }

        return true;
    }
    
    static GetEventChain(eventChainName, eventChains) {
        for (const eventChain of eventChains) {
            if (eventChain.name == eventChainName) {
                return eventChain;
            }
        }
        
        return null;
    }
}

//Database goes here

'use strict';

class ModelDatabase {
    db = null;
    
    constructor() { 
        if (!('indexedDB' in window)) {
            alert('This browser does not support IndexedDB');
            return;
        }
        
        const dbOpenRequest = window.indexedDB.open('letDatabase', 6);

        // Upgrade old database schemas.
        dbOpenRequest.onupgradeneeded = function(event) {
            this.db = event.target.result;
            
            if (event.oldVersion < 6) {
                if (event.oldVersion < 5) {
                    if (event.oldVersion < 4) {
                        if (event.oldVersion < 3) {
                            if (event.oldVersion < 2) {
                                if (event.oldVersion < 1) {
                                    this.db.createObjectStore('TaskStore', {keyPath: 'name', unique: true});
                                }
                                this.db.createObjectStore('DependencyStore', {keyPath: 'name', unique: true});
                            }
                            this.db.createObjectStore('TaskInstancesStore', {keyPath:'name', unique: true});
                        }
                        this.db.createObjectStore('DependencyInstancesStore', {keyPath: 'name', unique: true});
                    }
                    this.db.createObjectStore('SystemInputStore', {keyPath: 'name', unique: true});
                    this.db.createObjectStore('SystemOutputStore', {keyPath: 'name', unique: true});
                }
                this.db.createObjectStore('ConstraintStore', {keyPath: 'name', unique: true});
                this.db.createObjectStore('ConstraintInstancesStore', {keyPath: 'name', unique: true});
            }
        }

        dbOpenRequest.onerror = function(event) {
            // Do something with request.errorCode!
            console.error('ModelDatabase error: ' + event.target.errorCode);
        }

        dbOpenRequest.onsuccess = (event) => {
            this.db = event.target.result;

            this.db.onerror = function(event) {
                // Generic error handler for all errors targeted at this database's requests.
                console.error('ModelDatabase error: ' + event.target.errorCode);
            };
            
            // Hack to populate the View with tasks once the database is ready
            const databaseReadyEvent = new Event('DatabaseReady');
            window.dispatchEvent(databaseReadyEvent);
        };
    }
    
    getObjectStore(storeName, mode, promiseReject) {
        const transaction = this.db.transaction(storeName, mode);

        // Error handeller
        transaction.onerror = function(event) {
            promiseReject(console.log('ModelDatabase store error: ' + event.target.errorCode));
        }

        return transaction.objectStore(storeName);
    }
    
    
    putObject(storeName, object) {
        return new Promise((resolve, reject) => {
            const objectStore = this.getObjectStore(storeName, 'readwrite', reject);
            const putObject = objectStore.put(object);
        
            putObject.onsuccess = function(event) {
                resolve(event.target.result);
            }
        });
    }
    
    getObject(storeName, index, promiseResolve, promiseReject) {
        return new Promise((resolve, reject) => {
            const objectStore = this.getObjectStore(storeName, 'readonly', reject);
            const getObject = objectStore.get(index); // Get using the index

            getObject.onsuccess = function(event) {
                resolve(event.target.result);
            }
        });
    }
    
    getAllObjects(storeName, promiseResolve, promiseReject) {
        return new Promise((resolve, reject) => {
            const objectStore = this.getObjectStore(storeName, 'readonly', reject);
            const getObjects = objectStore.getAll();

            getObjects.onsuccess = function(event) {
                resolve(event.target.result);
            }
        });
    }
    
    deleteObject(storeName, index, promiseResolve, promiseReject) {
        return new Promise((resolve, reject) => {
            const objectStore = this.getObjectStore(storeName, 'readwrite', reject);
            const deleteObject = objectStore.delete(index); // Delete using the index

            deleteObject.onsuccess = function(event) {
                resolve(event.target.result);
            }
        });
    }
    
    deleteAllObjects(storeName, promiseResolve, promiseReject) {
        return new Promise((resolve, reject) => {
            const objectStore = this.getObjectStore(storeName, 'readwrite', reject);
            const deleteObjects = objectStore.clear();
        
            deleteObjects.onsuccess = function(event) {
                resolve(event.target.result);
            }
        });
    }
    
    
    // Task
    
    storeTask = function(task) {
        return this.putObject('TaskStore', task.parameters);
    }

    getTask = function(name) {
        return this.getObject('TaskStore', name);
    }

    getAllTasks = function() {
        return this.getAllObjects('TaskStore');
    }

    deleteTask = function(name) {
        return this.deleteObject('TaskStore', name);
    }
    
    deleteAllTasks = function() {
        return this.deleteAllObjects('TaskStore');
    }
    
    
    // Task Instances
    
    storeTaskInstances = function(taskInstances) {
        return this.putObject('TaskInstancesStore', taskInstances);
    }
    
    getTaskInstances = function(name) {
        return this.getObject('TaskInstancesStore', name);
    }
    
    getAllTasksInstances = function() {
        return this.getAllObjects('TaskInstancesStore');
    }

    deleteTaskInstances = function(name) {
        return this.deleteObject('TaskInstancesStore', name);
    }
    
    deleteAllTasksInstances = function() {
        return this.deleteAllObjects('TaskInstancesStore');
    }
    
    
    // Dependency

    storeDependency = function(dependency) {
        return this.putObject('DependencyStore', dependency);
    }

    getDependency  = function(name) {
        return this.getObject('DependencyStore', name);
    }
    
    getAllDependencies = function() {
        return this.getAllObjects('DependencyStore');
    }

    deleteDependency = function(name) {
        return this.deleteObject('DependencyStore', name);
    }

    deleteAllDependencies = function() {
        return this.deleteAllObjects('DependencyStore');
    }


    // Dependency Instances

    storeDependencyInstances = function(dependencyInstances) {
        return this.putObject('DependencyInstancesStore', dependencyInstances);
    }

    getDependencyInstances  = function(name) {
        return this.getObject('DependencyInstancesStore', name);
    }
    
    getAllDependenciesInstances = function() {
        return this.getAllObjects('DependencyInstancesStore');
    }

    deleteDependencyInstances = function(name) {
        return this.deleteObject('DependencyInstancesStore', name);
    }
    
    deleteAllDependenciesInstances = function() {
        return this.deleteAllObjects('DependencyInstancesStore');
    }
    
    
    // Constraint
    
    storeConstraint = function(constraint) {
        return this.putObject('ConstraintStore', constraint);
    }

    getConstraint  = function(name) {
        return this.getObject('ConstraintStore', name);
    }
    
    getAllConstraints = function() {
        return this.getAllObjects('ConstraintStore');
    }

    deleteConstraint = function(name) {
        return this.deleteObject('ConstraintStore', name);
    }

    deleteAllConstraints = function() {
        return this.deleteAllObjects('ConstraintStore');
    }
    
    
    // Constraint Instances
    
    storeConstraintInstances = function(constraintInstances) {
        return this.putObject('ConstraintInstancesStore', constraintInstances);
    }

    getConstraintInstances  = function(name) {
        return this.getObject('ConstraintInstancesStore', name);
    }
    
    getAllConstraintsInstances = function() {
        return this.getAllObjects('ConstraintInstancesStore');
    }

    deleteConstraintInstances = function(name) {
        return this.deleteObject('ConstraintInstancesStore', name);
    }
    
    deleteAllConstraintsInstances = function() {
        return this.deleteAllObjects('ConstraintInstancesStore');
    }
    
    
    // System Inputs
    
    storeInput = function(name) {
        return this.putObject('SystemInputStore', name);
    }

    getInput  = function(name) {
        return this.getObject('SystemInputStore', name);
    }
    
    getAllInputs = function() {
        return this.getAllObjects('SystemInputStore');
    }

    deleteInput = function(name) {
        return this.deleteObject('SystemInputStore', name);
    }

    deleteAllInputs = function() {
        return this.deleteAllObjects('SystemInputStore');
    }
    
    
    // System Outputs
    
    storeOutput = function(name) {
        return this.putObject('SystemOutputStore', name);
    }

    getOutput  = function(name) {
        return this.getObject('SystemOutputStore', name);
    }
    
    getAllOutputs = function() {
        return this.getAllObjects('SystemOutputStore');
    }

    deleteOutput = function(name) {
        return this.deleteObject('SystemOutputStore', name);
    }

    deleteAllOutputs = function() {
        return this.deleteAllObjects('SystemOutputStore');
    }
    

    // System export
    
    exportSystem = async function() {
        var system = {};
        var necessaryStoreNames = [];
        
        const allStoreNames = this.db.objectStoreNames;
        for (const storeName of allStoreNames) {
            if (!storeName.includes('Instance')) {
                necessaryStoreNames.push(storeName);
                system[storeName] = await this.getAllObjects(storeName);
            }
        }
        
        return system;
    }
    
    deleteSystem = function() {
        var deletePromises = [];
        
        const allStoreNames = this.db.objectStoreNames;
        for (const storeName of allStoreNames) {
            deletePromises.push(this.deleteAllObjects(storeName));
        }
        
        return Promise.all(deletePromises);
    }
    
    importSystem = function(system) {
        let importPromises = [];
        
        for (const [storeName, objects] of Object.entries(system)) {
            for (const object of objects) {
                importPromises.push(this.putObject(storeName, object));
            }
        }

        return Promise.all(importPromises);
    }
    

    toString() {
        return "Model";
    }

}

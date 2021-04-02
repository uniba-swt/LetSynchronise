//Database goes here

'use strict';

class ModelDatabase {
    db = null;
    
    constructor() { 
        if (!('indexedDB' in window)) {
            alert('This browser does not support IndexedDB');
            return;
        }
        
        const dbOpenRequest = window.indexedDB.open('letDatabase', 5);

        // Upgrade old database schemas.
        dbOpenRequest.onupgradeneeded = function(event) {
            this.db = event.target.result;
            
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
    
    putObject(storeName, mode, object, promiseResolve, promiseReject) {
        const objectStore = this.getObjectStore(storeName, mode, promiseReject);
        const putObject = objectStore.put(object);
        
        putObject.onsuccess = function(event) {
            promiseResolve(event.target.result);
        }
    }
    
    getObject(storeName, mode, index, promiseResolve, promiseReject) {
        const objectStore = this.getObjectStore(storeName, mode, promiseReject);
        const getObject = objectStore.get(index); // Get using the index

        getObject.onsuccess = function(event) {
            promiseResolve(event.target.result);
        }
    }
    
    getAllObjects(storeName, mode, promiseResolve, promiseReject) {
        const objectStore = this.getObjectStore(storeName, mode, promiseReject);
        const getObjects = objectStore.getAll();

        getObjects.onsuccess = function(event) {
            promiseResolve(event.target.result);
        }
    }
    
    deleteObject(storeName, mode, index, promiseResolve, promiseReject) {
        const objectStore = this.getObjectStore(storeName, mode, promiseReject);
        const deleteObject = objectStore.delete(index); // Delete using the index

        deleteObject.onsuccess = function(event) {
            promiseResolve(event.target.result);
        }
    }
    
    deleteAllObjects(storeName, mode, promiseResolve, promiseReject) {
        const objectStore = this.getObjectStore(storeName, mode, promiseReject);
        const deleteObjects = objectStore.clear();
        
        deleteObjects.onsuccess = function(event) {
            promiseResolve(event.target.result);
        }
    }
    
    
    // Task
    
    storeTask = function(task) {
        return new Promise((resolve, reject) => {
            this.putObject('TaskStore', 'readwrite', task.parameters, resolve, reject);
        });
    }

    getTask = function(name) {
        return new Promise((resolve, reject) => {
            this.getObject('TaskStore', 'readonly', name, resolve, reject);
        });
    }

    getAllTasks = function() {
        return new Promise((resolve, reject) => {
            this.getAllObjects('TaskStore', 'readonly', resolve, reject);
        });
    }

    deleteTask = function(name) {
        return new Promise((resolve, reject) => {
            this.deleteObject('TaskStore', 'readwrite', name, resolve, reject);
        });
    }
    
    deleteAllTasks = function() {
        return new Promise((resolve, reject) => {
            this.deleteAllObjects('TaskStore', 'readwrite', resolve, reject);
        });
    }
    
    
    // Task Instances
    
    storeTaskInstances = function(taskInstances) {
        return new Promise((resolve, reject) => {
            this.putObject('TaskInstancesStore', 'readwrite', taskInstances, resolve, reject);
        });
    }
    
    getTaskInstances = function(name) {
        return new Promise((resolve, reject) => {
            this.getObject('TaskInstancesStore', 'readonly', name, resolve, reject);
        });
    }
    
    getAllTasksInstances = function() {
        return new Promise((resolve, reject) => {
            this.getAllObjects('TaskInstancesStore', 'readonly', resolve, reject);
        });
    }

    deleteTaskInstances = function(name) {
        return new Promise((resolve, reject) => {
            this.deleteObject('TaskInstancesStore', 'readwrite', name, resolve, reject);
        });
    }
    
    deleteAllTasksInstances = function() {
        return new Promise((resolve, reject) => {
            this.deleteAllObjects('TaskInstancesStore', 'readwrite', resolve, reject);
        });
    }
    
    
    // Dependency

    storeDependency = function(dependency) {
        return new Promise((resolve, reject) => {
            this.putObject('DependencyStore', 'readwrite', dependency, resolve, reject);
        });
    }

    getDependency  = function(name) {
        return new Promise((resolve, reject) => {
            this.getObject('DependencyStore', 'readonly', name, resolve, reject);
        });
    }
    
    getAllDependencies = function() {
        return new Promise((resolve, reject) => {
            this.getAllObjects('DependencyStore', 'readonly', resolve, reject);
        });
    }

    deleteDependency = function(name) {
        return new Promise((resolve, reject) => {
            this.deleteObject('DependencyStore', 'readwrite', name, resolve, reject);
        });
    }

    deleteAllDependencies = function() {
        return new Promise((resolve, reject) => {
            this.deleteAllObjects('DependencyStore', 'readwrite', resolve, reject);
        });
    }


    // Dependency Instances

    storeDependencyInstances = function(dependency) {
        return new Promise((resolve, reject) => {
            this.putObject('DependencyInstancesStore', 'readwrite', dependency, resolve, reject);
        });
    }

    getDependencyInstances  = function(name) {
        return new Promise((resolve, reject) => {
            this.getObject('DependencyInstancesStore', 'readonly', name, resolve, reject);
        });
    }
    
    getAllDependenciesInstances = function() {
        return new Promise((resolve, reject) => {
            this.getAllObjects('DependencyInstancesStore', 'readonly', resolve, reject);
        });
    }

    deleteDependencyInstances = function(name) {
        return new Promise((resolve, reject) => {
            this.deleteObject('DependencyInstancesStore', 'readwrite', name, resolve, reject);
        });
    }
    
    deleteAllDependenciesInstances = function() {
        return new Promise((resolve, reject) => {
            this.deleteAllObjects('DependencyInstancesStore', 'readwrite', resolve, reject);
        });
    }
    
    
    // System Inputs
    
    storeInput = function(name) {
        return new Promise((resolve, reject) => {
            this.putObject('SystemInputStore', 'readwrite', name, resolve, reject);
        });
    }

    getInput  = function(name) {
        return new Promise((resolve, reject) => {
            this.getObject('SystemInputStore', 'readonly', name, resolve, reject);
        });
    }
    
    getAllInputs = function() {
        return new Promise((resolve, reject) => {
            this.getAllObjects('SystemInputStore', 'readonly', resolve, reject);
        });
    }

    deleteInput = function(name) {
        return new Promise((resolve, reject) => {
            this.deleteObject('SystemInputStore', 'readwrite', name, resolve, reject);
        });
    }

    deleteAllInputs = function() {
        return new Promise((resolve, reject) => {
            this.deleteAllObjects('SystemInputStore', 'readwrite', resolve, reject);
        });
    }
    
    
    // System Outputs
    
    storeOutput = function(name) {
        return new Promise((resolve, reject) => {
            this.putObject('SystemOutputStore', 'readwrite', name, resolve, reject);
        });
    }

    getOutput  = function(name) {
        return new Promise((resolve, reject) => {
            this.getObject('SystemOutputStore', 'readonly', name, resolve, reject);
        });
    }
    
    getAllOutputs = function() {
        return new Promise((resolve, reject) => {
            this.getAllObjects('SystemOutputStore', 'readonly', resolve, reject);
        });
    }

    deleteOutput = function(name) {
        return new Promise((resolve, reject) => {
            this.deleteObject('SystemOutputStore', 'readwrite', name, resolve, reject);
        });
    }

    deleteAllOutputs = function() {
        return new Promise((resolve, reject) => {
            this.deleteAllObjects('SystemOutputStore', 'readwrite', resolve, reject);
        });
    }
    

    // System export
    
    exportSystem = async function() {
        var system = {};
        var necessaryStoreNames = [];
        
        const allStoreNames = this.db.objectStoreNames;
        for (const storeName of allStoreNames) {
            if (!storeName.includes('Instance')) {
                necessaryStoreNames.push(storeName);
                system[storeName] = await new Promise((resolve, reject) => {
                    this.getAllObjects(storeName, 'readonly', resolve, reject)
                });
            }
        }
        
        return system;
    }
    
    deleteSystem = function() {
        var deletePromises = [];
        
        const allStoreNames = this.db.objectStoreNames;
        for (const storeName of allStoreNames) {
            deletePromises.push(new Promise((resolve, reject) => {
                this.deleteAllObjects(storeName, 'readwrite', resolve, reject)
            }));
        }
        
        return Promise.all(deletePromises);
    }
    
    importSystem = function(system) {
        let importPromises = [];
        
        for (const [storeName, objects] of Object.entries(system)) {
            for (const object of objects) {
                importPromises.push(new Promise((resolve, reject) => {
                    this.putObject(storeName, 'readwrite', object, resolve, reject);
                }));
            }
        }

        return Promise.all(importPromises);
    }
    

    toString() {
        return "Model";
    }

}

'use strict';

class ModelDatabase {
    db = null;
    
    constructor() { 
        if (!('indexedDB' in window)) {
            alert('This browser does not support IndexedDB');
            return;
        }
        
        const dbOpenRequest = window.indexedDB.open('letDatabase', 1);

        // Upgrade old database schemas.
        dbOpenRequest.onupgradeneeded = function(event) {
            this.db = event.target.result;
            if (event.oldVersion < 1) {
                this.db.createObjectStore(Model.DeviceStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.CoreStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.MemoryStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.NetworkDelayStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.SystemInputStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.SystemOutputStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.EntityStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.EntityInstancesStoreName, {keyPath:'name', unique: true});
                this.db.createObjectStore(Model.DependencyStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.DependencyInstancesStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.EventChainStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.EventChainInstanceStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.ConstraintStoreName, {keyPath: 'name', unique: true});
                this.db.createObjectStore(Model.ConstraintInstancesStoreName, {keyPath: 'name', unique: true});
            }
        }
        

        dbOpenRequest.onerror = function(event) {
            // Do something with request.errorCode!
            console.error(`ModelDatabase error: ${event.target.errorCode}`);
        }

        dbOpenRequest.onsuccess = (event) => {
            this.db = event.target.result;

            this.db.onerror = function(event) {
                // Generic error handler for all errors targeted at this database's requests.
                console.error(`ModelDatabase error: ${event.target.errorCode}`);
            };
            
            // Hack to populate the View with tasks once the database is ready
            const databaseReadyEvent = new Event('DatabaseReady');
            window.dispatchEvent(databaseReadyEvent);
        };
    }
    
    
    // Database methods
    
    getObjectStore(storeName, mode, promiseReject) {
        const transaction = this.db.transaction(storeName, mode);

        // Error handeller
        transaction.onerror = function(event) {
            promiseReject(console.error('ModelDatabase store error: ' + event.target.errorCode));
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

    getAllObjectsWithKeys(storeName) {
        return new Promise((resolve, reject) => {
            const objectStore = this.getObjectStore(storeName, 'readonly', reject);
            const items = [];
    
            const cursorRequest = objectStore.openCursor();
    
            cursorRequest.onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    items.push({ id: cursor.key, ...cursor.value });
                    cursor.continue();
                } else {
                    resolve(items);
                }
            };
    
            cursorRequest.onerror = function(event) {
                reject(event.target.error);
            };
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
    

    // System export and import.
    
    getObjectStoreNames(elements) {
        const elementMap = {
            'devices'      : Model.DeviceStoreName,
            'cores'        : Model.CoreStoreName,
            'memories'     : Model.MemoryStoreName,
            'networkDelays': Model.NetworkDelayStoreName,
            'inputs'       : Model.SystemInputStoreName,
            'outputs'      : Model.SystemOutputStoreName,
            'entities'     : Model.EntityStoreName,
            'dependencies' : Model.DependencyStoreName,
            'eventChains'  : Model.EventChainStoreName,
            'constraints'  : Model.ConstraintStoreName,
            'schedule'     : [
                                Model.ConstraintInstancesStoreName,
                                Model.DependencyInstancesStoreName,
                                Model.EventChainInstanceStoreName,
                                Model.EntityInstancesStoreName,
                             ],
        };
        
        return elements.flatMap(element => elementMap[element]);
    }
    
    exportSystem = async function(elementsSelected) {
        let system = { };
        
        const storeNames = this.getObjectStoreNames(elementsSelected);
        const allStoreNames = this.db.objectStoreNames;
        for (const storeName of storeNames) {
            if (allStoreNames.contains(storeName)) {
                system[storeName] = await this.getAllObjects(storeName);
            }
        }
        
        return system;
    }
    
    deleteSystem = function(elementsSelected) {
        let deletePromises = [ ];
        
        const storeNames = this.getObjectStoreNames(elementsSelected);
        const allStoreNames = this.db.objectStoreNames;
        for (const storeName of storeNames) {
            if (allStoreNames.contains(storeName)) {
                deletePromises.push(this.deleteAllObjects(storeName));
            }
        }
        
        return Promise.all(deletePromises);
    }
    
    importSystem = function(system, elementsSelected) {
        let importPromises = [ ];
        
        const storeNames = this.getObjectStoreNames(elementsSelected);
        for (const storeName of storeNames) {
            if (storeName in system) {
                for (const object of system[storeName]) {
                    importPromises.push(this.putObject(storeName, object));
                }
            }
        }

        return Promise.all(importPromises);
    }
    
    
    // Schedule delete.

    deleteSchedule = function(instancesStoreNames) {
        let deletePromises = [ ];

        if (instancesStoreNames == null) {
            instancesStoreNames = [... this.db.objectStoreNames];
        }
        instancesStoreNames = instancesStoreNames.filter(name => name.includes('Instance'));

        for (const instancesStoreName of instancesStoreNames) {
            deletePromises.push(this.deleteAllObjects(instancesStoreName));
        }

        return Promise.all(deletePromises);
    }
    

    toString() {
        return "Model";
    }

}

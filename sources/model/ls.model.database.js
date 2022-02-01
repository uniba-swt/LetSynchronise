'use strict';

class ModelDatabase {
    db = null;
    
    constructor() { 
        if (!('indexedDB' in window)) {
            alert('This browser does not support IndexedDB');
            return;
        }
        
        const dbOpenRequest = window.indexedDB.open('letDatabase', 2);

        // Upgrade old database schemas.
        dbOpenRequest.onupgradeneeded = function(event) {
            this.db = event.target.result;
            if (event.oldVersion < 2) {
                if (event.oldVersion < 1) {
                    this.db.createObjectStore(Model.TaskStoreName, {keyPath: 'name', unique: true});
                    this.db.createObjectStore(Model.DependencyStoreName, {keyPath: 'name', unique: true});
                    this.db.createObjectStore(Model.TaskInstancesStoreName, {keyPath:'name', unique: true});
                    this.db.createObjectStore(Model.DependencyInstancesStoreName, {keyPath: 'name', unique: true});
                    this.db.createObjectStore(Model.SystemInputStoreName, {keyPath: 'name', unique: true});
                    this.db.createObjectStore(Model.SystemOutputStoreName, {keyPath: 'name', unique: true});
                    this.db.createObjectStore(Model.ConstraintStoreName, {keyPath: 'name', unique: true});
                    this.db.createObjectStore(Model.ConstraintInstancesStoreName, {keyPath: 'name', unique: true});
                }
                this.db.createObjectStore('EventChainStore', {keyPath: 'name', unique: true});
                this.db.createObjectStore('EventChainInstanceStore', {keyPath: 'name', unique: true});
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
    
    
    // Database methods
    
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
    

    // System export and import
    
    exportSystem = async function() {
        let system = { };
        let necessaryStoreNames = [ ];
        
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
        let deletePromises = [ ];
        
        const allStoreNames = this.db.objectStoreNames;
        for (const storeName of allStoreNames) {
            deletePromises.push(this.deleteAllObjects(storeName));
        }
        
        return Promise.all(deletePromises);
    }
    
    deleteSchedule = function() {
        let deletePromises = [ ];
        
        const instancesStoreNames = [
            Model.TaskInstancesStoreName
        ];
        for (const instancesStoreName of instancesStoreNames) {
            deletePromises.push(this.deleteAllObjects(instancesStoreName));
        }
        
        return Promise.all(deletePromises);
    }
    
    importSystem = function(system) {
        let importPromises = [ ];
        
        for (const [storeName, objects] of Object.entries(system)) {
            for (const object of objects) {
                importPromises.push(this.putObject(storeName, object));
            }
        }

        return Promise.all(importPromises);
    }
    
    importSchedule = function(schedule) {
        let importPromises = [ ];
        
        for (const [storeName, objects] of Object.entries(schedule)) {
            if (storeName.includes('Instance')) {
                for (const object of objects) {
                    importPromises.push(this.putObject(storeName, object));
                    console.log(storeName, object);
                }
            }
        }
        
        return Promise.all(importPromises);
    }
    

    toString() {
        return "Model";
    }

}

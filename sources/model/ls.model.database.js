//Database goes here

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
                    const taskStore = this.db.createObjectStore('TaskStore', {keyPath: 'name', unique: true});
                }
                const dependencyStore = this.db.createObjectStore('DependencyStore', {keyPath: 'name', unique: true});
            }
            
            //let index = store.createIndex("name","name",{unique: true});
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
    
    storeTask = function(task) {
        const transaction = this.db.transaction('TaskStore', 'readwrite');

        // Error handeller
        transaction.onerror = function(event) {
            console.log('ModelDatabase store error: ' + event.target.errorCode);
        }

        const objectStore = transaction.objectStore('TaskStore');
        const putTask = objectStore.put(task.taskParameters);
    }


    getTask = function(callbacks, name) {
        const transaction = this.db.transaction('TaskStore', 'readonly');
        
        // Error handeller
        transaction.onerror = function(event) {
            console.log('ModelDatabase store error: ' + event.target.errorCode);
        }
        
        const objectStore = transaction.objectStore('TaskStore');
        const getTask = objectStore.get(name); // Get using the index

        getTask.onsuccess = function(event) {
            callbacks.forEach(callback => callback(event.target.result));
        }
    }

    getAllTasks = function(callbacks) {
        const transaction = this.db.transaction('TaskStore', 'readonly');
        
        // Error handeller
        transaction.onerror = function(event) {
            console.log('ModelDatabase store error: ' + event.target.errorCode);
        }
        
        const objectStore = transaction.objectStore('TaskStore');
        const getTasks = objectStore.getAll(); // Get using the index
        
        getTasks.onsuccess = function(event) {
            callbacks.forEach(callback => callback(event.target.result));
        }
    }

    storeDependency = function(dependency) {
        const transaction = this.db.transaction('DependencyStore', 'readwrite');

        // Error handeller
        transaction.onerror = function(event) {
            console.log('ModelDatabase store error: ' + event.target.errorCode);
        }

        const objectStore = transaction.objectStore('DependencyStore');
        const putTask = objectStore.put(dependency);
    }

    getAllDependenciesFormatted = function(callbacks) {
        const formatDependencies = function(dependencies) {
            //console.log(dependencies);
            let formatted = [];
            for (const i in dependencies) {
                let d = dependencies[i];
                let df = {'name': d.name, 'destination': d.destination.task+'.'+d.destination.port , 'source': d.source.task+'.'+d.source.port};
                formatted[i] = df;
            }
            callbacks.forEach(callback => callback(formatted));
        }
        this.getAllDependencies([formatDependencies]);
    }

    getAllDependencies = function(callbacks) {
        const transaction = this.db.transaction('DependencyStore', 'readonly');
        
        // Error handeller
        transaction.onerror = function(event) {
            console.log('ModelDatabase store error: ' + event.target.errorCode);
        }
        
        const objectStore = transaction.objectStore('DependencyStore');
        const getTasks = objectStore.getAll(); // Get using the index
        
        getTasks.onsuccess = function(event) {
            callbacks.forEach(callback => callback(event.target.result));
        }
    }

    getDependency  = function(callbacks, name) {
        const transaction = this.db.transaction('DependencyStore', 'readonly');
        
        // Error handeller
        transaction.onerror = function(event) {
            console.log('ModelDatabase store error: ' + event.target.errorCode);
        }
        
        const objectStore = transaction.objectStore('DependencyStore');
        const getTask = objectStore.get(name); // Get using the index

        getTask.onsuccess = function(event) {
            callbacks.forEach(callback => callback(event.target.result));
        }
    }

    deleteDependency = function(callbacks, args, name) {
        const transaction = this.db.transaction('DependencyStore', 'readwrite');
        
        // Error handeller
        transaction.onerror = function(event) {
            console.log('ModelDatabase store error: ' + event.target.errorCode);
        }
        
        const objectStore = transaction.objectStore('DependencyStore');
        const request = objectStore.delete(name); // Get using the index

        request.onsuccess = function(event) {
            //console.log(event);
            callbacks.forEach(callback => callback(args));
        }
    }

}

//Database goes here

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
            const store = db.createObjectStore('TaskStore', {keyPath: 'name', unique: true});
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

}

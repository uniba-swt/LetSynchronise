//Database goes here

'use strict';

class ModelDatabase {
    db = null;
    
    constructor() { 
        if (!('indexedDB' in window)) {
            alert('This browser does not support IndexedDB');
            return;
        }
        
        const dbOpenRequest = window.indexedDB.open('letDatabase', 3);

        // Upgrade old database schemas.
        dbOpenRequest.onupgradeneeded = function(event) {
            this.db = event.target.result;
            if (event.oldVersion < 3) {
                if (event.oldVersion < 2) {
					if (event.oldVersion < 1) {
						const taskStore = this.db.createObjectStore('TaskStore', {keyPath: 'name', unique: true});
					}
					const dependencyStore = this.db.createObjectStore('DependencyStore', {keyPath: 'name', unique: true});
				}
				const taskInstancesStore = this.db.createObjectStore('TaskInstancesStore', {keyPath:'name', unique: true});
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
    
    getObjectStore(storeName, mode) {
    	const transaction = this.db.transaction(storeName, mode);

        // Error handeller
        transaction.onerror = function(event) {
            console.log('ModelDatabase store error: ' + event.target.errorCode);
        }

        return transaction.objectStore(storeName);
    }
    
    storeTask = function(task) {
    	const objectStore = this.getObjectStore('TaskStore', 'readwrite');
    	const putTask = objectStore.put(task.parameters);
    }


    getTask = function(callbacks, name) {
        const objectStore = this.getObjectStore('TaskStore', 'readonly');
        const getTask = objectStore.get(name); // Get using the index

        getTask.onsuccess = function(event) {
            callbacks.forEach(callback => callback(event.target.result));
        }
    }

    getAllTasks = function(callbacks) {
        const objectStore = this.getObjectStore('TaskStore', 'readonly');
        const getTasks = objectStore.getAll(); 
        
        getTasks.onsuccess = function(event) {
            callbacks.forEach(callback => callback(event.target.result));
        }
    }

    deleteTask = function(callbacks, args, name) {
    	const objectStore = this.getObjectStore('TaskStore', 'readwrite');
        const deleteTask = objectStore.delete(name); // Delete using the index

        deleteTask.onsuccess = function(event) {
            callbacks.forEach(callback => callback(args));
        }
    }

    storeDependency = function(dependency) {
    	const objectStore = this.getObjectStore('DependencyStore', 'readwrite');
        const putDependency = objectStore.put(dependency);
    }

    getDependency  = function(callbacks, name) {
    	const objectStore = this.getObjectStore('DependencyStore', 'readonly');
        const getDependency = objectStore.get(name); // Get using the index

        getDependency.onsuccess = function(event) {
            callbacks.forEach(callback => callback(event.target.result));
        }
    }
    
    getAllDependencies = function(callbacks) {
    	const objectStore = this.getObjectStore('DependencyStore', 'readonly');
        const getDependencies = objectStore.getAll(); 
        
        getDependencies.onsuccess = function(event) {
            callbacks.forEach(callback => callback(event.target.result));
        }
    }
    
    getAllDependenciesFormatted = function(callbacks) {
        const formatDependencies = function(dependencies) {
            let dependenciesFormatted = [];
            for (const dependency of dependencies) {
                let dependencyFormatted = {
                		'name': dependency.name, 
						'destination': `${dependency.destination.task}.${dependency.destination.port}`,
						'source': `${dependency.source.task}.${dependency.source.port}`
                	};
                dependenciesFormatted.push(dependencyFormatted);
            }
            callbacks.forEach(callback => callback(dependenciesFormatted));
        }
        this.getAllDependencies([formatDependencies]);
    }

    deleteDependency = function(callbacks, args, name) {
    	const objectStore = this.getObjectStore('DependencyStore', 'readwrite');
        const request = objectStore.delete(name); // Delete using the index

        request.onsuccess = function(event) {
            callbacks.forEach(callback => callback(args));
        }
    }

}

//Database goes here

'use strict';

class ModelDatabase {
    constructor() { 
        if (!('indexedDB' in window)) {
            alert('This browser doesn\'t support IndexedDB');
            return;
        } else {
            //alert('ok');
        }
        this.request = window.indexedDB.open("letDatabase", 1);

        this.request.onupgradeneeded = function(e) {
            let db = e.target.result;
            let store = db.createObjectStore("TaskStore", {keyPath: "name", unique: true});
            //let index = store.createIndex("name","name",{unique: true});
        }

        this.request.onerror = function(e) {
            // Do something with request.errorCode!
            console.log("There was an error: " + e.target.errorCode);
        }

        this.request.onsuccess = function(e) {
            //alert("Database success:" + e);
        }
    }

    storeTask = function(task) {
        let db = this.request.result;
        let tx = db.transaction("TaskStore", "readwrite");
        let store = tx.objectStore("TaskStore");
        //let index = store.index("name");
        store.put(task.taskParameters);

        //Error handeller
        db.onerror = function(e) {
            console.log("ERROR"+e.target.errorCode);
        }
        

        /*tx.oncomplete = function() {
            db.close(); //if closed no further transections
        }*/
    }

    getTask = function(callback, name) {
        let db = this.request.result;
        let tx = db.transaction("TaskStore", "readwrite");
        let store = tx.objectStore("TaskStore");
        const task = store.get(name); // Get using the index

        //async so need handlers
        task.onsuccess = function() {
        	callback(task.result);
            console.log(task.result)
        }
    }

    getAllTasks = function(callback) {
        let db = this.request.result;
        let tx = db.transaction("TaskStore", "readwrite");
        let store = tx.objectStore("TaskStore");
        let tasks = store.getAll(); // Get using the index

        //async so need handlers
        tasks.onsuccess = function() {
        	callback(tasks.result);
            console.log(tasks.result);
        }
    }

}

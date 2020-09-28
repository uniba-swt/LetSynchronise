// In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

if (!window.indexedDB) {
    alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}else{
    console.log("Good, you have IndexDB Support.")
}

// Let us open our database
let request = window.indexedDB.open("MyTestDatabase", 1),
    db,
    tx,
    store,
    index;

request.onupgradeneeded = function(e) {
    let db = request.result,
        store = db.createObjectStore("QuestionStore", {
            keyPath: "qID"
        }),
        index = store.createIndex("questionText","questionText",{unique: false});
}

request.onerror = function(e) {
    // Do something with request.errorCode!
    console.log("There was an error: " + e.target.errorCode);
};

request.onsuccess = function(e) {
    // Do something with request.result!
    db = request.result;
    tx = db.transaction("QuestionStore", "readwrite");
    store = tx.objectStore("QuestionStore");
    index = store.index("questionText");

    //Error handeller
    db.onerror = function(e) {
        console.log("ERROR"+e.target.errorCode);
    }

    store.put({qID : 1, questionText : "The sky is blue.", correctAnswer : true, studentAnswer: true, result : true})
    store.put({qID : 2, questionText : "The grass is green.", correctAnswer : true, studentAnswer: true, result : true})

    let q1 = store.get(1); // Get using the key
    let qs = index.get("The grass is green."); //get using index

    //async so need handlers
    q1.onsuccess = function() {
        console.log(q1.result);
        console.log(q1.result.questionText);
    }

    qs.onsuccess = function() {
        console.log(qs.result.questionText);
    }

    tx.oncomplete = function() {
        db.close();
    }
};
// -----------------------------------------------------
// DOM modification
// -----------------------------------------------------

document.querySelector('h1').onclick = function() {
    if (this.textContent === 'LetSynchronise: LET Task Simulator') {
        this.textContent = 'LetSynchronise';
    } else {
        this.textContent = 'LetSynchronise: LET Task Simulator';
    }
}

function displayTime() {
    let date = new Date();
    let time = date.toLocaleTimeString();
    document.querySelector('#current-time').textContent = time;
}

const createClock = setInterval(displayTime, 1000);


// -----------------------------------------------------
// IndexedDB
// -----------------------------------------------------

let database;

window.onload = function() {
    // Open our database; it is created if it doesn't already exist
    // (see onupgradeneeded below)
    let request = window.indexedDB.open('info_db', 1);
    
    // Setup the database tables if this has not already been done
    request.onupgradeneeded = function(event) {
        // Grab a reference to the opened database
        let database = event.target.result;
        
        // Create an objectStore to store our notes in (basically like a single table)
        let objectStore = database.createObjectStore('info_os', {keyPath: 'name'});
        
        // Define what data items the objectStore will contain
        objectStore.createIndex('initials', 'initials', {unique: false});
        
        console.log('Database setup complete');
    };
    
    // onerror handler signifies that the database didn't open successfully
    request.onerror = function() {
        console.log('Database failed to open');
    };
    
    // onsuccess handler signifies that the database opened successfully
    request.onsuccess = function() {
        console.log('Database opened successfully');
        
        // Store the opened database object in the database variable. This is used a lot below
        database = request.result;
        
        // Run the displayInfo() function to display the info already in the IDB
        displayInfo();
    };
};


let myHeading = document.querySelector('h2');

function setInfo() {
    let name = prompt('Enter a name.');
    let initials = prompt('Enter initials');

    let newItem = {
        name: name,
        initials: initials
    }
    
    // open a read/write db transaction, ready for adding the data
    let transaction = database.transaction(['info_os'], 'readwrite');
    
    // call an object store that's already been added to the database
    let objectStore = transaction.objectStore('info_os');
    
    // clear what is already in the object store
    objectStore.clear();
    
    // Make a request to add our newItem object to the object store
    let request = objectStore.add(newItem);
    request.onsuccess = function() {
        return;
    };
    
    // Report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function() {
        console.log('Transaction completed: database modification finished.');
        
        myHeading.textContent = `Saved information: ${name} (${initials})`;
    };
    
    transaction.onerror = function() {
        console.log('Transaction not opened due to error.');
    };
    
}

function displayInfo() {
    // Open our object store and then get a cursor - which iterates through all the
    // different data items in the store
    let objectStore = database.transaction('info_os').objectStore('info_os');
    objectStore.openCursor().onsuccess = function(event) {
        // Get a reference to the cursor
        let cursor = event.target.result;
        
        // If there is still another data item to iterate through, keep running this code
        if (cursor) {
            let name = cursor.value.name;
            let initials = cursor.value.initials;
            
            myHeading.textContent = `Saved information: ${name} (${initials})`;
        } else {
            setInfo();
        }
    }
}

document.querySelector('button').addEventListener('click', setInfo);


// -----------------------------------------------------
// Canvas animation and object definition
// -----------------------------------------------------

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;

const canvasRect = document.querySelector('canvas').getBoundingClientRect();
const height = canvas.height = window.innerHeight - canvasRect.top;

function random(min, max) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}

function Ball(x, y, velX, velY, color, radius, context) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.color = color;
    this.radius = radius;
    this.context = context;
}

Ball.prototype.draw = function() {
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.context.fill();
}

Ball.prototype.update = function() {
    if ((this.x + this.radius) >= width) {
        this.velX = -(this.velX);
    }
    
    if ((this.x - this.radius) <= 0) {
        this.velX = -(this.velX);
    }
    
    if ((this.y + this.radius) >= height) {
        this.velY = -(this.velY);
    }
    
    if ((this.y - this.radius) <= 0) {
        this.velY = -(this.velY);
    }
    
    this.x += this.velX;
    this.y += this.velY;
}

Ball.prototype.collisionDetect = function() {
    for (let j = 0; j < balls.length; j++) {
        if (this !== balls[j]) {
            const dx = this.x - balls[j].x;
            const dy = this.y - balls[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.radius + balls[j].radius) {
                balls[j].color = this.color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')';
            }
        }
    }
}

let balls = [];

while (balls.length < 25) {
    let radius = random(10, 20);
    let ball = new Ball(
        // ball position always drawn at least one ball width
        // away from the edge of the canvas, to avoid drawing errors
        random(0 + radius, width - radius),
        random(0 + radius, height - radius),
        random(-7, 7),
        random(-7, 7),
        'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')',
        radius,
        context
    );
    
    balls.push(ball);
}

let startTime = null;

function loop(timeStamp) {
    if (startTime === null && timeStamp !== null) {
        startTime = timeStamp;
    }
    
    const timeDelta = timeStamp - startTime;
    startTime = timeStamp;
    document.querySelector('#time-delta').textContent = timeDelta;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.25)';
    context.fillRect(0, 0, width, height);
    
    for (let i = 0; i < balls.length; i++) {
        balls[i].draw();
        balls[i].update();
        balls[i].collisionDetect();
    }
    
    requestAnimationFrame(loop);
}

loop(null);

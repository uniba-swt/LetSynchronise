"use strict";

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


// -----------------------------------------------------
// D3
// -----------------------------------------------------

function randomLetters() {
    return d3.shuffle('abcdefghijklmnopqrstuvwxyz'.split(''))
    .slice(0, Math.floor(1 + Math.random() * 5))
    .sort();
}

const letters1 = randomLetters();
const letters2 = randomLetters();
console.log(letters1);
console.log(letters2);

d3.select('ul')
  .selectAll('li')
  .data(letters1)
  .enter()
  .append('li')
    .text(d => d);

const textUpdate =
d3.select('ul')
  .selectAll('li')
  .data(letters2)
    .text(d => d);

const textEnter = textUpdate.enter().append('li').text(d => d);
const textExit = textUpdate.exit().remove();
// textEnter.merge(textUpdate).text(d => d);


const data3 = [60, 80, 120, 150, 200];

const scale =
d3.scaleLinear()
  .domain([0, d3.max(data3)])
  .range([0, 600]);

// Add scales to axis
const x_axis =
d3.axisBottom()
  .scale(scale);

const barHeight = 20;
const barMargin = 2;

const bar =
d3.select('#d3-example')
  .append('g')
  .attr('transform', `translate(50, 10)`);

const group =
bar.selectAll('g')
   .data(data3)
   .enter()
   .append('g')
     .attr('transform', (d, i) => `translate(0, ${i * (barHeight + barMargin)})`);

group.append('rect')
     .attr('width', d => scale(d))
     .attr('height', barHeight)
     .on('mouseover', function() {
         d3.select(this)
           .transition()
             .ease(d3.easeLinear)
             .style('fill', 'green');
     })
     .on('mouseout', function() {
         d3.select(this)
           .transition()
             .ease(d3.easeExpInOut)
             .style('fill', 'grey');
     });

group.append('text')
     .attr('x', 10)
     .attr('y', barHeight * 0.5)
     .attr('dy', '0.35em')
     .text(d => `Value: ${d}`);

bar.append('g')
   .attr('transform', (d, i) => `translate(0, ${data3.length * (barHeight + barMargin)})`)
   .call(x_axis);


document.querySelector("#read-button").onclick = function () {
    if(document.querySelector("#file-input").files.length == 0) {
        alert('Error : No file selected');
        return;
    }
    
    // first file selected by user
    const file = document.querySelector("#file-input").files[0];
    
    // perform validation on file type & size if required
    
    // read the file
    const reader = new FileReader();
    reader.readAsText(file);
    
    // file reading started
    reader.addEventListener('loadstart', function() {
        console.log('File reading started');
    });
    
    // file reading finished successfully
    reader.addEventListener('load', function(e) {
        // contents of file in variable
        const text = e.target.result;
        const json = JSON.parse(text);
        
        console.log(json);
        
        const textUpdate =
        d3.select('ul')
        .selectAll('li')
        .data(json)
        
        const textEnter = textUpdate.enter().append('li');
        const textExit = textUpdate.exit().remove();
        textEnter.merge(textUpdate).text(d => `${d.Name} is ${d.Age} years old`);
    });
    
    // file reading failed
    reader.addEventListener('error', function() {
        alert('Error : Failed to read file');
    });
    
    // file read progress
    reader.addEventListener('progress', function(e) {
        if (e.lengthComputable == true) {
            var percent_read = Math.floor((e.loaded/e.total)*100);
            console.log(percent_read + '% read');
        }
    });
    
};

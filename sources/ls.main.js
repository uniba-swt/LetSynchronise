'use strict';

const app = new Controller();
app.setView(new View());
app.setModel(new Model());

console.log(app.toString());
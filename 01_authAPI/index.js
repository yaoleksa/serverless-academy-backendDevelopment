// define all required packages
const express = require('express');
const pg = require('pg');
const bcrypt = require('bcrypt');
//define port
const port = process.env.PORT || 3000;
// define application itself
const app = express();
// define middleware
app.use((req, res, next) => {
    // WARNING!!! It's not a real middleware
    console.log('This is just am example. Real middleware will be added letter');
    next();
});
// define method handlers
app.get('/', (req, res) => {
    res.send(`successful request at: ${new Date()}`);
});
app.post('/auth/sign-in', (req, res) => {
    res.sendStatus(200);
});
app.post('/auth/sign-up', (req, res) => {
    res.sendStatus(201);
});
// start listening to the application on the defined port
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
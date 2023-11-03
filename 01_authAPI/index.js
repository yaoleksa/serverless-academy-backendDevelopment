// define all required packages
const express = require('express');
const pg = require('pg');
const bcrypt = require('bcrypt');
//define port
const port = process.env.PORT || 3000;
// define application itself
const app = express();
// define middleware
app.use(express.json({extended: false}));
app.use((req, res, next) => {
    const data = [];
    req.on('data', chunk => {
        data.push(chunk);
    });
    req.on('end', () => {
        req.body = JSON.parse(Buffer.concat(data).toString());
    });
    next();
})
// define method handlers
app.get('/', (req, res) => {
    res.send(`successful request at: ${new Date()}`);
});
app.post('/auth/sign-in', (req, res) => {
    req.on('end', () => {
        console.log(`body now: ${req.body.email}`);
    })
    res.sendStatus(200);
});
app.post('/auth/sign-up', (req, res) => {
    res.sendStatus(201);
});
// start listening to the application on the defined port
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
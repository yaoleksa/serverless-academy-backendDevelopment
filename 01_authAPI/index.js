// define all required packages
const express = require('express');
const pg = require('pg');
const bcrypt = require('bcrypt');
//define port
const port = process.env.PORT || 3000;
// define DB url
const superbaseUrl = process.env.URL;
// define API key
const superbaseKey = process.env.KEY;
// conect with DB
const client = new pg.Client({
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD
});
// define application itself
const app = express();
// define middleware
app.use(express.json({extended: false}));
app.use((req, res, next) => {
    if(req.method == 'GET') {
        next();
        return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Accept', 'application/json');
    const data = [];
    req.on('data', chunk => {
        data.push(chunk);
    });
    req.on('end', () => {
        if(data.length == 0) {
            res.send('Body is empty, there are no required parameters\n');
            next();
            return;
        }
        const body = JSON.parse(Buffer.concat(data).toString());
        if(!body.email) {
            res.send('Email is missing. Email is required\n');
            next();
            return;
        }
        // validate email
        if(body.email && !/.{1,}@.{1,}\.{1,}/.test(body.email)) {
            res.send('Invalid email format\n');
            next();
            return;
        }
        if(!body.password) {
            res.send('Password is missing. Password is required\n');
            next();
            return;
        }
        req.body = body;
    });
    next();
});
// define method handlers
app.get('/', (req, res) => {
    client.connect().then(() => {
        client.query('SELECT * FROM "Users";').then(data => {
            console.log(data.rows);
        });
    })
    res.send(`successful request at: ${new Date()}`);
});
app.post('/auth/sign-in', (req, res, next) => {
    req.on('end', () => {
        if(req.body && req.body.email && /.{1,}@.{1,}\.{1,}/.test(req.body.email) && req.body.password) {
            try {
                res.sendStatus(200);
            } catch(exception) {
                console.error(exception.message);
            }
        }
    });
});
app.post('/auth/sign-up', (req, res) => {
    req.on('end', () => {
        if(req.body && req.body.email && /.{1,}@.{1,}\.{1,}/.test(req.body.email) && req.body.password) {
            try {
                res.sendStatus(200);
            } catch(exception) {
                console.error(exception.message);
            }
        }
    });
});
// start listening to the application on the defined port
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
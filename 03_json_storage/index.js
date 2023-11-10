// define all required packages
const express = require('express');
const { Client } = require('pg');
const fs = require('fs');
// define database client
const client = new Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    port: process.env.DBPORT,
    password: process.env.PASSWORD
});
// Connect with database
client.connect();
// define application itself
const app = express();
// define middleware
app.use((req, res, next) => {
    if(req.method == 'GET') {
        next();
        return;
    }
    if(Object.keys(req.query).length > 0) {
        next();
        return;
    }
    const data = [];
    req.on('data', chunk => {
        if(chunk) {
            data.push(chunk);
        }
    });
    req.on('end', () => {
        try {
            if(data.length == 0) {
                next();
                return;
            }
            req.body = JSON.parse(Buffer.concat(data).toString());
        } catch(exception) {
            res.send(exception.message);
            next();
            return;
        }
    });
    next();
});
// define HTTP methods' handlers
app.get('/:name', (req, res, next) => {
    client.query('SELECT * FROM "jsonbase" WHERE name=$1', [req.params.name]).then(response => {
        if(response.rows.length == 0) {
            res.send('Record with such name does not exit\n');
            next();
            return;
        } else {
            res.send(`${JSON.stringify(response.rows, null, 2)}\n`);
            next();
            return;
        }
    });
});
app.put('/:name', (req, res, next) => {
    if(req.query.file) {
        const content = fs.readFileSync(req.query.file);
            client.query('INSERT INTO jsonbase(name, data) VALUES($1, $2) RETURNING *;', [req.params.name, content]).then(response => {
                res.send(`${JSON.stringify(response.rows, null, 2)}\n`);
                next();
                return;
            }).catch(exception => {
                res.send(exception.message);
                next();
                return;
            });
    }
    req.on('end', () => {
        if(Object.keys(req.query).length == 0) {
            client.query('INSERT INTO jsonbase(name, data) VALUES($1, $2) RETURNING *;', [req.params.name, req.body]).then(response => {
                res.send(`${JSON.stringify(response.rows, null, 2)}\n`);
            }).catch(exception => {
                res.send(exception.message);
                next();
                return;
            });
        }
    });
});
app.listen({
    port: process.env.PORT,
    host: '0.0.0.0'
}, () => {
    console.log(`http://localhost:${process.env.PORT}`);
})
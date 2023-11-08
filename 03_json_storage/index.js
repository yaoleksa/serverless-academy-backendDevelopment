// define all required packages
const express = require('express');
const { Client } = require('pg');
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
    const data = [];
    req.on('data', chunk => {
        data.push(chunk);
    });
    req.on('end', () => {
        try {
            req.body = JSON.parse(Buffer.concat(data).toString());
        } catch(exception) {
            res.send(exception.message);
            next();
            return;
        }
    });
    next();
});
app.get('/json', (req, res, next) => {
    if(Object.keys(req.query).length > 0 && req.query.select && req.query.where) {
        client.query(`SELECT ${req.query.select} FROM "jsonbase" WHERE ${req.query.where};`).then(response => {
            try {
                res.send(JSON.stringify(response.rows, null, 2));
            } catch(exception) {
                res.send(exception.message);
            }
            next();
            return;
        });
    } else if(Object.keys(req.query).length > 0 && req.query.select && !req.query.where) {
        client.query(`SELECT ${req.query.select} FROM "jsonbase";`).then(response => {
            res.send(JSON.stringify(response.rows, null, 2));
            next();
            return;
        });
    } else {
        client.query('SELECT * FROM "jsonbase";').then(response => {
            res.send(JSON.stringify(response.rows, null, 2));
        });
    }
});
app.put('/json', (req, res, next) => {
    req.on('end', () => {
        client.query('INSERT INTO jsonbase(name, data) VALUES($1, $2) RETURNING *', [req.body.name, req.body.data]).then(response => {
            res.send(response.rows);
        }).catch(exception => {
            res.send(exception.message);
            next();
            return;
        })
    })
});
app.listen({
    port: process.env.PORT,
    host: '0.0.0.0'
}, () => {
    console.log(`http://localhost:${process.env.PORT}`);
})
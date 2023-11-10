// define all required packages
const express = require('express');
const openurl = require('openurl');
const { Client } = require('pg');
const ShortUniqueId = require('short-unique-id');
// define port number
const port = process.env.PORT;
// define ID generator
const uid = new ShortUniqueId({length: 10});
// define database client
const client = new Client({
    host: process.env.HOST,
    database: process.env.NAME,
    port: process.env.DBPORT,
    user: process.env.USER,
    password: process.env.PASSWORD
});
// connect to database
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
        req.body = Buffer.concat(data).toString();
    });
    next();
    return;
});
// define method handlers
app.get('/:id', (req, res, next) => {
    if(req.params.id == 'favicon.ico') {
        next();
        return;
    }
    client.query('SELECT url FROM "urlmap" WHERE id=$1', [req.params.id]).then(response => {
        if(!response || !response.rows || !response.rows[0] || !response.rows[0].url) {
            res.send('Such url does not exist\n');
            next();
            return;
        }
        openurl.open(response.rows[0].url);
        res.send(response.rows[0].url + '\n');
    });
});
app.post('/', (req, res, next) => {
    req.on('end', () => {
        if(!req.body || (!/^http:\/\/.{1,}/g.test(req.body) && !/^https:\/\/.{1,}/g.test(req.body))) {
            res.send('Not valid url! Please, try again\n');
            next();
            return;
        }
        client.query('SELECT id, url FROM "urlmap" WHERE url=$1', [req.body]).then(response => {
            if(response.rows.length == 0) {
                client.query('INSERT INTO urlmap(id, url) VALUES($1, $2) RETURNING *', [uid.rnd(), req.body]).then(response => {
                    res.send(req.protocol + '://' + req.get('host') + '/' + response.rows[0].id + '\n');
                });
            } else {
                res.send(req.protocol + '://' + req.get('host') + '/' + response.rows[0].id + '\n');
            }
        });
    });
});
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
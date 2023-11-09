// define all required packages
const express = require('express');
const openurl = require('openurl');
const { Client } = require('pg');
// define port number
const port = process.env.PORT;
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
        client.query('INSERT INTO urlmap(url) VALUES($1) RETURNING *', [req.body]).then(response => {
            res.send(req.protocol + '://' + req.get('host') + '/' + response.rows[0].id + '\n');
        })
    });
});
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
// define all required packages
const shortUrl = require('node-url-shortener');
const express = require('express');
// define port number
const port = 3000;
// define application itself
const app = express();
// define middleware
app.use((req, res, next) => {
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
// define GET method handler
app.get('/', (req, res, next) => {
    req.on('end', () => {
        shortUrl.short(req.body, (err, url) => {
            if(err) {
                res.send(err.message);
                next();
                return;
            } else if(url) {
                res.send(url + '\n');
            }
        });
    });
});
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
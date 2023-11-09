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
// define POST method handler
app.post('/', (req, res, next) => {
    req.on('end', () => {
        if(!req.body || (!/^http:\/\/.{1,}/g.test(req.body) && !/^https:\/\/.{1,}/g.test(req.body))) {
            res.send('Not valid url! Please, try again\n');
            next();
            return;
        }
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
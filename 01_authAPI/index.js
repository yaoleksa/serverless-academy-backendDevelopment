// define all required packages
const express = require('express');
const pg = require('pg');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
//define port
const port = process.env.PORT || 3000;
// define DB url
const superbaseUrl = process.env.URL;
// define API key
const superbaseKey = process.env.KEY;
// define superbase client
const superbase = createClient(superbaseUrl, superbaseKey);
// variables to store tokens
let refreshToken;
let token;
// conect with DB
const client = new pg.Client({
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD
});
client.connect();
// define application itself
const app = express();
// define middleware
app.use(express.json({extended: false}));
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Accept', 'application/json');
    if(req.method == 'GET') {
        next();
        return;
    }
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
app.get('/me', (req, res) => {
    //
});
app.post('/auth/sign-in', (req, res, next) => {
    req.on('end', () => {
        if(req.body && req.body.email && /.{1,}@.{1,}\.{1,}/.test(req.body.email) && req.body.password) {
            try {
                superbase.auth.signInWithPassword({
                    email: req.body.email,
                    password: req.body.password
                }).then(response => {
                    token = response.data.session.access_token;
                    refreshToken = response.data.session.refresh_token;
                    res.send(JSON.stringify({
                        "success": true,
                        "data": {
                            "id": response.data.user.id,
                            "accessToken": token,
                            "refreshToken": refreshToken
                        }
                    }, null, 2) + '\n');
                })
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
                bcrypt.genSalt((err, salt) => {
                    if(err) {
                        console.error(`genSaltError: ${err.message}`);
                    }
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if(err) {
                            console.log(err.message);
                        }
                        superbase.auth.signUp({
                            email: req.body.email,
                            password: hash,
                        }).then(response => {
                            token = response.data.session.access_token;
                            refreshToken = response.data.session.refresh_token;
                            res.send(JSON.stringify({
                                "success": true,
                                "data": {
                                    "id": response.data.user.id,
                                    "accessToken": token,
                                    "refreshToken": refreshToken
                                }
                            }, null, 2) + '\n');
                        })
                    });
                });
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
// define all required packages
const express = require('express');
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
// define application itself
const app = express();
// define middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
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
app.get('/me', (req, res, next) => {
    if(!req.headers.authorization) {
        res.send('Request header does not contain authorization key. JWT token is required\n');
        next();
        return;
    }
    const jwt = req.headers.authorization.split(' ')[1];
    if(!jwt) {
        res.send("Unproper Authorization format. You should use Bearer your_token template\n");
        next();
        return;
    }
    try {
        superbase.auth.getUser(jwt).then(response => {
            if(!response.data.user) {
                res.send("Invalid JWT token\n");
                next();
                return;
            }
            res.send(JSON.stringify({
                "success": true,
                "data": {
                    "id": response.data.user.id,
                    "email": response.data.user.email
                }
            }, null, 2));
        });
    } catch(exception) {
        res.send(JSON.stringify({
            "success": false,
            "data": null
        }, null, 2));
        next();
        return;
    }
});
app.post('/auth/sign-in', (req, res, next) => {
    req.on('end', () => {
        if(req.body && req.body.email && /.{1,}@.{1,}\.{1,}/.test(req.body.email) && req.body.password) {
            try {
                superbase.auth.signInWithPassword({
                    email: req.body.email,
                    password: req.body.password
                }).then(response => {
                    if(!response.data.user) {
                        if(response.error) {
                            res.send(response.error.message + '\n');
                            next();
                            return;
                        }
                        res.send('Invalid credential\n');
                        next();
                        return;
                    }
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
                });
            } catch(exception) {
                res.send(JSON.stringify({
                    "success": false,
                    "data": null
                }, null, 2));
            }
        }
    });
});
app.post('/auth/sign-up', (req, res, next) => {
    req.on('end', () => {
        if(req.body && req.body.email && /.{1,}@.{1,}\.{1,}/.test(req.body.email) && req.body.password) {
            try {
                if(req.body.password.length < 6) {
                    res.send("Password should have at least 6 signs\n");
                    next();
                    return;
                }
                superbase.auth.signUp({
                    email: req.body.email,
                    password: req.body.password
                }).then(response => {
                    if(!response.data.user) {
                        console.log(response);
                        if(response.error) {
                            res.send(response.error.message + '\n');
                            next();
                            return;
                        }
                        res.send("Unable to create a new usser\n");
                        next();
                        return;
                    }
                    token = response.data.session.access_token,
                    refreshToken = response.data.session.refresh_token;
                    res.send(JSON.stringify({
                        "success": true,
                        "data": {
                            "id": response.data.user.id,
                            "accessToken": token,
                            "refreshToken": refreshToken
                        }
                    }, null, 2));
                });
            } catch(exception) {
                res.send(JSON.stringify({
                    "success": false,
                    "data": null
                }, null, 2));
                next();
                return;
            }
        }
    });
});
// start listening to the application on the defined port
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
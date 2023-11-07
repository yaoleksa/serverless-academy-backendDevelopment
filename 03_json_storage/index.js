// define all required packages
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const { response } = require('express');
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
// define supabase client
const supabase = createClient(process.env.URL, process.env.KEY);
// define application itself
const app = express();
app.get('/json', (req, res) => {
    client.query('SELECT * FROM "jsonbase";').then(response => {
        res.send(JSON.stringify(response.rows, null, 2));
    });
});
app.listen({
    port: process.env.PORT,
    host: '0.0.0.0'
}, () => {
    console.log(`http://localhost:${process.env.PORT}`);
})
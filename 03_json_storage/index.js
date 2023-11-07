// define all required packages
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
// define supabase client
const supabase = createClient(process.env.URL, process.env.KEY);
// define application itself
const app = express();
app.get('/', (req, res) => {
    res.send(`ip: ${req.socket.remoteAddress}`);
});
app.listen({
    port: process.env.PORT,
    host: '0.0.0.0'
}, () => {
    console.log(`http://localhost:${process.env.PORT}`);
})
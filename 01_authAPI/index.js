// define all required packages
const express = require('express');
const pg = require('pg');
const bcrypt = require('bcrypt');
//define port
const port = process.env.PORT || 3000;
// define application itself
const app = express();
app.get('/', (req, res) => {
    res.send(`successful request at: ${new Date()}`);
});
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
// define all reuired packages
const express = require('express');
const fs = require('fs');
// define port
const port = 3000;
// define application itself
const app = express();
// define IP to number converter function
const IPtoNum = (ip) => {
    const dot = ip.split('.');
    if(dot.length != 3) {
        return NaN;
    }
    try {
        return 256**3 * parseInt(dot[0]) + 256**2 * parseInt(dot[1]) + 256 * parseInt(dot[2]) + parseInt(dot[3]);
    } catch(exception) {
        console.error(exception.message);
    }
}
app.get('/', (req, res) => {
    res.send(`Successful request at ${new Date()}`);
});
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
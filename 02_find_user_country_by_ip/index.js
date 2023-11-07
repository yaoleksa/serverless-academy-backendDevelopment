// define all reuired packages
const express = require('express');
const fs = require('fs');
const { parse } = require('csv-parse');
// define port
const port = 3000;
// define application itself
const app = express();
// define IP to number converter function
const IPtoNum = (ip) => {
    const dot = ip.split('.');
    if(dot.length != 4) {
        return NaN;
    }
    try {
        return 256**3 * parseInt(dot[0]) + 256**2 * parseInt(dot[1]) + 256 * parseInt(dot[2]) + parseInt(dot[3]);
    } catch(exception) {
        console.error(exception.message);
    }
}
// variable to store IPs' range
const countries = [];
// read file with IPs' range
fs.createReadStream('IP2LOCATION-LITE-DB1.CSV').pipe(parse({delimiter: ',', from_line: 1})).on('data', row => {
    countries.push(row);
}).on('end', () => {
    console.log('end');
});
app.get('/', (req, res) => {
    const IPasNum = IPtoNum(req.header('x-forwarded-for') || req.socket.remoteAddress);
    console.log(countries.filter(e => parseInt(e[0]) <= IPasNum && parseInt(e[1]) >= IPasNum));
    res.send(`your address is: ${req.header('x-forwarded-for') || req.socket.remoteAddress} 
    in single number format: ${IPtoNum(req.header('x-forwarded-for') || req.socket.remoteAddress)}`);
});
app.listen({
    port: 3000,
    host: '0.0.0.0'
}, () => {
    console.log(`http://localhost:${port}`);
});
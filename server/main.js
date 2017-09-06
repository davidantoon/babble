const express = require('express');
const app = express();



app.get('/', function (req, res) {
    res.send('Hello World!')
});

app.post('/', function (req, res) {
    res.send('Got a POST request')
});

app.listen(8080, function () {
    console.log('Example app listening on port 3000!')
});
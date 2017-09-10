const express = require('express');
const utils = require('./utils');
const bodyParser = require('body-parser');

const frontEndServer = express();
const backendServer = express();

frontEndServer.use(bodyParser.json());
frontEndServer.use(bodyParser.urlencoded({extended: true}));
backendServer.use(bodyParser.json());
backendServer.use(bodyParser.urlencoded({extended: true}));

let clients = [];
let messages = [];
let actions = [];


frontEndServer.use(express.static('client'));
frontEndServer.listen(8080, function () {
    console.log('Front-End Server listening on port 8080')
});


backendServer.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Content-Type', 'application/json');
    next();
});


function pushToClients(msg) {
    while (clients.length > 0) {
        let client = clients.pop();
        client.end(JSON.stringify({msg}));
    }
}

backendServer.post('/messages', function (req, res) {
    console.log("add new message");

    let msg = {
        name: utils.checkString(req.body, res, "name"),
        email: utils.checkString(req.body, res, "email"),
        message: utils.checkString(req.body, res, "message"),
        timestamp: utils.checkInt(req.body, res, "timestamp"),
        id: messages.length
    };

    messages.push(msg);
    pushToClients(msg);
    res.status(200).send(msg.id + "");
});

backendServer.get('/messages', function (req, res) {
    let count = utils.checkInt(req.query, res, "counter");

    console.log("get messages counter = " + count);
    if (messages.length > count) {
        res.end(JSON.stringify(messages.slice(count)));
    } else {
        clients.push(res);
    }
});

backendServer.delete('/messages/:id', function (req, res) {

    console.log("delete message id = " + id);

    // if (messages.length > count) {
    //     res.end(JSON.stringify(messages.slice(count)));
    // } else {
    //     clients.push(res);
    // }
});

backendServer.listen(9000, function () {
    console.log('Backend Server listening on port 9000')
});



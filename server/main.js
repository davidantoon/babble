const express = require('express');
const bodyParser = require('body-parser');
const utils = require('./utils');
const messages = require('./messages-util');
const onlineUtils = require('./online-utils');

const frontEndServer = express();
const backendServer = express();

frontEndServer.use(bodyParser.json());
frontEndServer.use(bodyParser.urlencoded({extended: true}));
backendServer.use(bodyParser.json());
backendServer.use(bodyParser.urlencoded({extended: true}));

let clients = [];
let clientsState = [];

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
        client.end(JSON.stringify([msg]));
    }
}


backendServer.post('/messages', function (req, res) {
    console.log("add new message");

    let msg = {
        name: utils.checkString(req.body, res, "name"),
        email: utils.checkString(req.body, res, "email"),
        message: utils.checkString(req.body, res, "message"),
        timestamp: utils.checkInt(req.body, res, "timestamp"),
    };
    let id = messages.addMessage(msg);
    pushToClients(msg);
    res.status(200).send(id + "");
});

backendServer.get('/messages', function (req, res) {
    let count = utils.checkInt(req.query, res, "counter");

    console.log("get messages counter = " + count);

    let newMessage = messages.getMessages(count);

    if (newMessage.length > 0) {
        res.end(JSON.stringify(newMessage));
    } else {
        clients.push(res);
    }
    onlineUtils.pushToClients();
});

backendServer.get('/states', function (req, res) {
    let id = utils.checkString(req.query, res, "id");

    console.log("get states id = " + id);
    let msgCount = messages.getVisibleMessagesCount();

    if (msgCount + "_" + onlineUtils.clientsOnline.length !== id) {
        res.end(JSON.stringify({users: onlineUtils.clientsOnline.length, messages: msgCount}));
    } else {
        onlineUtils.clientsState.push(res);
    }
});

backendServer.get('/online', function (req, res) {

    onlineUtils.addOnline(res);
    req.on("close", function () {
        onlineUtils.removeOnline(res);
    })
});


backendServer.delete('/messages/:id', function (req, res) {
    let id = utils.checkInt(req.params, res, "id");

    console.log("delete message id = " + id);
    let deleteMsg = messages.deleteMessage(id);
    pushToClients(deleteMsg);
    res.status(200).send("true");
});

backendServer.listen(9000, function () {
    console.log('Backend Server listening on port 9000')
});



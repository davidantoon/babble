'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const utils = require('./utils');
const messages = require('./messages-util');
const onlineUtils = require('./online-utils');
const md5 = require('./md5');

module.exports = {

    backendServer: express(),
    port: 9000,
    clients: [],

    serverHeaders(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.header('Content-Type', 'application/json');
        next();
    },


    addAPI(method, path, func) {
        this.backendServer[method](path, func);
    },

    pushToClients(msg) {
        while (this.clients.length > 0) {
            let client = this.clients.pop();
            client.end(JSON.stringify([msg]));
        }
    },

    addNewMessages(req, res) {
        console.log("add new message");

        let msg = {
            name: utils.checkString(req.body, res, "name"),
            email: utils.checkString(req.body, res, "email"),
            message: utils.checkString(req.body, res, "message"),
            timestamp: utils.checkInt(req.body, res, "timestamp"),
            image: "https://www.gravatar.com/avatar/" + md5.MD5(utils.checkString(req.body, res, "email").trim().toLowerCase()) + "?s=60&d=identicon",
        };
        let id = messages.addMessage(msg);
        this.pushToClients(msg);
        res.status(200).send(id + "");
    },
    getMessages(req, res) {
        let count = utils.checkInt(req.query, res, "counter");

        console.log("get messages counter = " + count);

        let newMessage = messages.getMessages(count);

        if (newMessage.length > 0) {
            res.end(JSON.stringify(newMessage));
        } else {
            this.clients.push(res);
        }
        onlineUtils.pushToClients();
    },
    getStats(req, res) {
        res.end(JSON.stringify({messages: messages.getCount(), users: onlineUtils.clientsOnline.length}));
    },
    getOnline(req, res) {
        onlineUtils.addOnline(res);
        req.on("close", function () {
            onlineUtils.removeOnline(res);
        })
    },
    deleteMessage(req, res) {
        let id = utils.checkInt(req.params, res, "id");

        console.log("delete message id = " + id);
        let deleteMsg = messages.deleteMessage(id);
        this.pushToClients(deleteMsg);
        res.status(200).send("true");
    },


    start() {
        this.backendServer.use(bodyParser.json());
        this.backendServer.use(bodyParser.urlencoded({extended: true}));
        this.backendServer.all('*', this.serverHeaders);


        this.addAPI("post", "/messages", this.addNewMessages.bind(this));
        this.addAPI("get", "/messages", this.getMessages.bind(this));
        this.addAPI("get", "/stats", this.getStats.bind(this));
        this.addAPI("get", "/online", this.getOnline.bind(this));
        this.addAPI("delete", "/messages/:id", this.deleteMessage.bind(this));


        this.backendServer.listen(this.port, function () {
            console.log('Backend Server listening on port ' + this.port)
        }.bind(this));
    },


};

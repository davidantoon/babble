'use strict';

const express = require('express');
const bodyParser = require('body-parser');

module.exports = {

    clientTestServer: express(),
    port: 8081,

    start() {
        this.clientTestServer.use(bodyParser.json());
        this.clientTestServer.use(bodyParser.urlencoded({extended: true}));

        this.clientTestServer.use(express.static('.'));
        this.clientTestServer.listen(this.port, function () {
            console.log('Client Test Server listening on port ' + this.port)
        }.bind(this));
    }
};

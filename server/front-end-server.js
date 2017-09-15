'use strict';

const express = require('express');
const bodyParser = require('body-parser');

module.exports = {

    frontEndServer: express(),
    port: 8080,
    start() {
        this.frontEndServer.use(bodyParser.json());
        this.frontEndServer.use(bodyParser.urlencoded({extended: true}));

        this.frontEndServer.use(express.static('client'));
        this.frontEndServer.listen(this.port, function () {
            console.log('Front-End Server listening on port ' + this.port)
        }.bind(this));
    }
};

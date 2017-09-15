const messages = require("./messages-util");

'use strict';

module.exports = {

    clientsState: [],
    clientsOnline: [],

    pushToClients() {
        while (this.clientsState.length > 0) {
            let client = this.clientsState.pop();
            client.end(JSON.stringify({messages: messages.getCount(), users: this.clientsOnline.length}));
        }
    },


    addOnline(res) {
        console.log("online opened");
        this.clientsOnline.push(res);
        this.pushToClients();
    },

    removeOnline(res) {
        console.log("online closed");
        this.clientsOnline = [
            ...this.clientsOnline.slice(0, this.clientsOnline.indexOf(res)),
            ...this.clientsOnline.slice(this.clientsOnline.indexOf(res) + 1)
        ];
        this.pushToClients();
    }

};
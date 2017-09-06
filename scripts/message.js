const Utils = require("utils");

const Message = function (json) {
    this.id = json.id;
    this.name = json.name;
    this.email = json.email;
    this.message = json.message;
    this.timestamp = json.timestamp;

    this.ownerUrl = Utils.get
};

Message.prototype.loadArray = function (array) {
    let messages = [];
    for (let i = 0; i < array.length; i++) {
        messages.push(new Message(array[i]));
    }
    return messages;
};

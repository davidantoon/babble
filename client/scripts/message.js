const Message = function (json) {
    this.id = json.id;
    this.name = json.name;
    this.email = json.email;
    this.message = json.message;
    this.timestamp = json.timestamp;
    this.image = Utils.getGravatar(this.email);
    this.deletedMessage = json.deletedMessage !== null && json.deletedMessage !== undefined;
};

Message.loadArray = function (array) {
    let messages = [];
    for (let i = 0; i < array.length; i++) {
        messages.push(new Message(array[i]));
    }
    return messages;
};

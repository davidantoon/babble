const Message = function (json) {
    this.id = json.id;
    this.name = json.name;
    this.email = json.email;
    this.message = json.message;
    this.timestamp = json.timestamp;
    this.image = MD5(this.email);

    this.delete = function (callback) {
        Babble.deleteMessage(this.id, callback);
    };

    this.save = function (callback) {
        Babble.postMessage(this.message, )
    };
};

Message.loadArray = function (array) {
    let messages = [];
    for (let i = 0; i < array.length; i++) {
        messages.push(new Message(array[i]));
    }
    return messages;
};

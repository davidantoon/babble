'use strict';

module.exports = {

    messages: [],

    addMessage(message) {
        message.id = this.messages.length;
        this.messages.push(message);
        return message.id;
    },

    getMessages(counter) {
        if (this.messages.length > counter) {
            return this.messages.slice(counter)
        }
        return [];
    },


    deleteMessage(id) {
        let deleteMsg = JSON.parse(JSON.stringify(this.messages[id]));
        deleteMsg.deletedMessage = true;
        this.messages.push(deleteMsg);
        return deleteMsg;
    },


    getCount() {
        return this.messages.length;
    },

    getVisibleMessagesCount() {
        let msgCount = 0;
        this.messages.forEach((msg) => {
            msgCount += msg.deletedMessage ? -1 : 1
        });
        return msgCount > 0 ? msgCount : 0;
    }
};
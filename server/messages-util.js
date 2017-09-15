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
        let index = 0;
        for(let i=0; i<this.messages.length; i++){
            if(this.messages[i].id === id){
                index = i;
                break;
            }
        }
        let deleteMsg = JSON.parse(JSON.stringify(this.messages[index]));
        deleteMsg.deletedMessage = true;
        this.messages = this.messages.slice(0, index).concat(this.messages.slice(index + 1));
        return deleteMsg;
    },

    getCount() {
        return this.messages.length;
    },
};
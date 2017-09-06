const Babble = {};

Babble.register = function (userInfo) {
    console.log(TAG, "register()", userInfo);
};
Babble.getMessages = function (counter, callback) {
    console.log(TAG, "getMessages()", counter);
};
Babble.postMessage = function (message, callback) {
    console.log(TAG, "postMessage()", message);
};
Babble.deleteMessage = function (id, callback) {
    console.log(TAG, "deleteMessage()", id);
};
Babble.getStats = function (callback) {
    console.log(TAG, "getStats()");
};

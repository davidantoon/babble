const MD5 = require("md5");

const Utils = {};


Utils.getGravatar = function (email) {
    let emailMD5 = MD5(email.trim().toLowerCase());
    return "https://www.gravatar.com/avatar/" + emailMD5 + "?s=36&d=identicon";
};

export default Utils;
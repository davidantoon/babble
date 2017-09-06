const Utils = {};

Utils.getGravatar = function (email) {
    if (email === null || email === undefined) {
        throw new NullPointerException("Email must not be empty");
    }
    let emailMD5 = MD5(email.trim().toLowerCase());
    return "https://www.gravatar.com/avatar/" + emailMD5 + "?s=60&d=identicon";
};


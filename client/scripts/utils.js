const Utils = {};

Utils.getGravatar = function (email) {
    if (email === null || email === undefined) {
        throw new NullPointerException("Email must not be empty");
    }
    let emailMD5 = MD5(email.trim().toLowerCase());
    return "https://www.gravatar.com/avatar/" + emailMD5 + "?s=60&d=identicon";
};

Utils.isShiftKey = function (code) {
    return code === 16;
};

Utils.isEnterKey = function (code) {
    return code === 13;
};


Utils.getHoursMinutes = function (timestamp) {
    let date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();

    return hours + ":" + (minutes < 10 ? "0" : "") + minutes;
};


Utils.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};

Utils.scrollTo = function (element, to, duration) {
    let start = element.scrollTop, change = to - start, currentTime = 0, increment = 20;

    let animateScroll = function () {
        currentTime += increment;
        var val = Utils.easeInOutQuad(currentTime, start, change, duration);
        console.log(val);
        element.scrollTop = val;
        if (currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };
    animateScroll();
};
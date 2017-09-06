function NotLoggedIn(message) {
    this.name = "NotLoggedIn";
    this.message = (message || "");
}

NotLoggedIn.prototype = new Error();
NotLoggedIn.prototype.constructor = NotLoggedIn;



function NullPointerException(message) {
    this.name = "NullPointerException";
    this.message = (message || "");
}

NullPointerException.prototype = new Error();
NullPointerException.prototype.constructor = NullPointerException;



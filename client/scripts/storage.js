Babble.storage = new function () {

    const TAG = "Storage";
    const STORAGE_KEY = "babble";

    this.logout = function () {
        localStorage.clear();
    };

    this.isLoggedIn = function () {
        try {
            this.checkLoggedIn();
            return true;
        } catch (ignore) {
            return false;
        }
    };

    this.checkLoggedIn = function () {
        let babbleData = localStorage.getItem(STORAGE_KEY);
        if (babbleData === null) {
            throw new NotLoggedIn();
        }
        try {
            JSON.parse(babbleData)
        } catch (e) {
            console.log(TAG, "invalid babble data", e);
            this.logout();
            throw new NotLoggedIn();
        }
    };

    this.setUserInfo = function (name, email) {
        let babbleData = {
            currentMessage: "",
            userInfo: {
                name: name,
                email: email
            }
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(babbleData));
    };

    this.getUserInfo = function () {
        if (this.isLoggedIn()) {
            let babbleData = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return babbleData.userInfo;
        }
        return null;
    };

    this.setCurrentMessage = function (message) {

        if (message === null || message === undefined) {
            throw new NullPointerException("Message must not be empty")
        }
        this.checkLoggedIn();

        let babbleData = JSON.parse(localStorage.getItem(STORAGE_KEY));
        babbleData.currentMessage = message;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(babbleData));
    };

    this.getCurrentMessage = function () {
        if (this.isLoggedIn()) {
            let babbleData = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return babbleData.userInfo;
        }
        return null;
    };
}();

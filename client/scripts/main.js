Babble.run = function () {
    this.setupElements();
    this.autoResizeTextArea();
    this.setListeners();
    this.polling();

    this.setLoginDialogVisibility(!this.storage.isLoggedIn());

    if (!this.storage.isLoggedIn()) {
        return;
    }
    this.$loggedInLabel.innerText = "Hey " + this.storage.getUserInfo().name + ", ";
};


Babble.setupElements = function () {
    this.$messagesCount = document.getElementById("messagesCount");
    this.$usersCount = document.getElementById("usersCount");
    this.$messages = document.getElementById("messages");
    this.$sendMessageForm = document.getElementById("sendMessageForm");
    this.$sendMessageText = document.getElementById("sendMessageText");
    this.$sendMessageButton = document.getElementById("sendMessageButton");
    this.$loginDialog = document.getElementById("loginDialog");
    this.$loginForm = document.getElementById("loginForm");
    this.$fullName = document.getElementById("fullName");
    this.$email = document.getElementById("email");
    this.$logoutButton = document.getElementById("logoutButton");
    this.$loggedInLabel = document.getElementById("loggedInLabel");

};

Babble.setListeners = function () {

    this.$loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        Babble.register({name: this.$fullName.value, email: this.$email.value});
        this.setLoginDialogVisibility(false);
        this.$loggedInLabel.innerText = "Hey " + this.storage.getUserInfo().name + ", ";
    }.bind(this));

    this.$loginForm.addEventListener("reset", function (e) {
        e.preventDefault();
        Babble.register({name: this.$fullName.value, email: this.$email.value});
        this.setLoginDialogVisibility(false);
        this.$loggedInLabel.innerText = "Hey " + this.storage.getUserInfo().name + ", ";
    }.bind(this));


    this.$logoutButton.addEventListener("click", function (e) {
        this.storage.logout();
        this.setLoginDialogVisibility(true);
    }.bind(this));


    this.$sendMessageText.addEventListener("keydown", function (e) {
        if (Utils.isShiftKey(e.keyCode)) {
            this.shiftKeyDown = true;
        }
    }.bind(this));
    this.$sendMessageText.addEventListener("keyup", function (e) {
        if (Utils.isShiftKey(e.keyCode)) {
            this.shiftKeyDown = false;
        }
        if (Utils.isEnterKey(e.keyCode) && !this.shiftKeyDown) {
            this.$sendMessageButton.click();
        }
    }.bind(this));

    this.$sendMessageForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (this.$sendMessageText.value.trim().length === 0) {
            return;
        }
        let message = this.$sendMessageText.value;
        this.$sendMessageText.isDisabled = true;
        this.$sendMessageText.value = "";
        this.$sendMessageText.style.cssText = 'height:80px';
        this.postMessage(message, function () {
            this.$sendMessageText.isDisabled = false;
        }.bind(this))

    }.bind(this));
};

Babble.setLoginDialogVisibility = function (visible) {
    this.$loginDialog.style.cssText = visible ? "display:block" : "display:none";
    this.$logoutButton.style.cssText = visible ? "display:none" : "display:block";
};


Babble.polling = function () {
    Babble.getMessages(Babble.messages.length, function (data) {
        Babble.pushNewMessagesToDOM(data);
        Babble.polling();
    });
};


Babble.pushNewMessagesToDOM = function (msgs) {
    for (let i = 0; i < msgs.length; i++) {
        let msg = msgs[i];

        if (msg.deletedMessage) {
            this.$messages.removeChild(document.querySelector(".message[message-id='" + msg.id + "']"));
            continue;
        }

        let img = document.createElement("img");
        img.setAttribute("src", msg.image);
        img.setAttribute("width", "40");
        img.setAttribute("height", "40");

        let name = document.createElement("cite");
        name.innerHTML = msg.name;

        let time = document.createElement("time");
        time.innerHTML = Utils.getHoursMinutes(msg.timestamp);
        time.setAttribute("datetime", new Date(msg.timestamp));

        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("class", "delete-button");
        deleteButton.setAttribute("aria-label", "Delete Message");
        deleteButton.setAttribute("tabindex", "-1");
        deleteButton.setAttribute("message-id", msg.id);
        deleteButton.innerHTML = "x";

        deleteButton.addEventListener('click', function (e) {
            Babble.deleteMessage(msg.id, function () {
                this.parentElement.parentElement.parentElement.parentElement
                    .removeChild(this.parentElement.parentElement.parentElement);
            }.bind(this));
        }, false);

        let topLayout = document.createElement("div");
        topLayout.setAttribute("class", "top-layout");
        topLayout.appendChild(name);
        topLayout.appendChild(time);
        topLayout.appendChild(deleteButton);


        let messageText = document.createElement("pre");
        messageText.setAttribute("class", "text");
        messageText.innerText = msg.message;

        let messageContent = document.createElement("div");
        messageContent.setAttribute("class", "content");
        messageContent.setAttribute("tabindex", "1");

        messageContent.appendChild(topLayout);
        messageContent.appendChild(messageText);

        let msgDom = document.createElement("li");
        msgDom.setAttribute("class", "message");
        msgDom.appendChild(img);
        msgDom.appendChild(messageContent);
        msgDom.setAttribute("message-id", msg.id);

        this.$messages.appendChild(msgDom);
    }
};

Babble.register = function (userInfo) {
    console.log("register()", userInfo);
    let fullname = userInfo.name;
    let email = userInfo.email;
    this.storage.setUserInfo(fullname, email);
};
Babble.getMessages = function (counter, callback) {
    console.log("getMessages(counter)", "counter = ", counter);
    Babble.http.get("messages?counter=" + encodeURI(counter), "").then(function (data, error) {
        if (error !== null && error !== undefined) {
            alert("Failed to get messages");
            return;
        }
        let newMessages = Message.loadArray(data);
        this.messages = this.messages.concat(newMessages);
        callback(newMessages);
    }.bind(this));

};
Babble.postMessage = function (message, callback) {
    console.log("postMessage(message, callback)", "message = ", message);
    let userInfo = Babble.storage.getUserInfo();
    let data = Babble.storage.getUserInfo();
    data["message"] = message;
    data["timestamp"] = new Date().getTime();

    Babble.http.post("messages", data).then(function (data, error) {
        if (error !== null && error !== undefined) {
            alert("Failed to post message");
        }
        Utils.scrollTo(this.$messages.parentElement, this.$messages.parentElement.scrollHeight, 300);
        callback();
    }.bind(this));
};
Babble.deleteMessage = function (id, callback) {
    console.log("deleteMessage()", id);

};
Babble.getStats = function (callback) {
    console.log("getStats()");
    
};


/*
    Register an event listener on key down in send message text area
    and compute the scroll height to auto resize to max 300px.
 */
Babble.autoResizeTextArea = function () {
    this.$sendMessageText.addEventListener('keydown', autosize);

    function autosize() {
        let el = this;

        /*
            Using setTimeout to prevent keydown UI blocking.
         */
        setTimeout(function () {
            // set height auto to auto compute the scroll height
            el.style.cssText = 'height:auto; padding:0';
            var height = el.scrollHeight > 280 ? 280 : el.scrollHeight;
            height = height < 80 ? 80 : height;
            // height += 20;
            el.style.cssText = 'height:' + height + 'px';
        }, 0);
    }
};

Babble.run();
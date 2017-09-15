window.Babble = window.Babble ? window.Babble : {messages: [], states: {messages:0, users:0}};
Babble.run = function () {
    this.setupElements();
    this.autoResizeTextArea();
    this.setListeners();
    this.polling();
    this.pollingStates();
    this.pollingOnline();

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
        Babble.register({name: "Anonymous", email: "anonymous@anonymous.com"});
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

        let message = Babble.storage.getUserInfo();
        data["message"] = message;
        data["timestamp"] = new Date().getTime();

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
    Babble.getMessages(Babble.messages.length, function (newMessages) {
        Babble.pushNewMessagesToDOM(newMessages);
        Babble.polling();
    });
};

Babble.pollingStates = function () {
    console.log("pollingStates");
    Babble.getStats(Babble.states.messages + "_" + Babble.states.users, function (data) {
        this.$messagesCount.innerText = data.messages + "";
        this.$usersCount.innerText = data.users + "";
        this.states = data;
        this.pollingStates();
    }.bind(this));
};

Babble.pollingOnline = function () {
    console.log("pollingStates");
    Babble.getOnline(function () {
        this.pollingOnline();
    }.bind(this));
};


Babble.pushNewMessagesToDOM = function (msgs) {

    for (let i = 0; i < msgs.length; i++) {
        let msg = msgs[i];

        if (msg.deletedMessage) {
            let node = document.querySelector(".message[message-id='" + msg.id + "']");
            if(node !== null) {
                this.$messages.removeChild(node);
            }
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
    Babble.http.get("messages?counter=" + encodeURI(counter), "").then(function (data) {
        let error = data[1];
        data = data[0];
        if (error !== null && error !== undefined) {
            alert("Failed to get messages");
            return;
        }
        let newMessages = Message.loadArray(data);

        for(let i=0; i< newMessages.length; i++){
            if(newMessages[i].deletedMessage){
                this.messages = this.messages.slice(0, newMessages[i].id).concat(this.messages.slice(newMessages[i].id));
            }else {
                this.messages.push(newMessages[i]);
            }
        }
        callback(newMessages);
    }.bind(this));

};
Babble.postMessage = function (message, callback) {
    console.log("postMessage(message, callback)", "message = ", message);

    Babble.http.post("messages", message).then(function (data) {
        let error = data[1];
        data = data[0];
        if (error !== null && error !== undefined) {
            alert("Failed to post message");
        }
        if(this.$messages !== undefined) {
            Utils.scrollTo(this.$messages.parentElement, this.$messages.parentElement.scrollHeight, 300);
        }
        debugger;
        callback(data);
    }.bind(this));
};
Babble.deleteMessage = function (id, callback) {
    console.log("deleteMessage()", id);
    Babble.http.delete("messages/" + id, function (data) {
        console.log(data);
    }.bind(this));
};
Babble.getStats = function (id, callback) {
    console.log("getStats()");
    Babble.http.get("states?id=" + encodeURI(id), "").then(function (data) {
        let error = data[1];
        data = data[0];
        if (error !== null && error !== undefined) {
            alert("Failed to get states");
            return;
        }
        callback(data);
    }.bind(this));
};

Babble.getOnline = function (callback) {
    console.log("getOnline()");
    Babble.http.get("online", "").then(function (data) {
        let error = data[1];
        if (error !== null && error !== undefined) {
            setTimeout(callback, 2000);
            return;
        }
        callback();
    }.bind(this));
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
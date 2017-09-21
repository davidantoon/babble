window.Babble = new function () {
    const STORAGE_KEY = "babble";
    const BASE_URL = "http://localhost:9000/";

    const Message = function (json) {
        this.id = json.id;
        this.name = json.name;
        this.email = json.email;
        this.message = json.message;
        this.timestamp = json.timestamp;
        this.image = json.image;
        this.deletedMessage = json.deletedMessage !== null && json.deletedMessage !== undefined;
    };

    Message.loadArray = function (array) {
        let messages = [];
        for (let i = 0; i < array.length; i++) {
            messages.push(new Message(array[i]));
        }
        return messages;
    };


    this.messages = [];
    this.states = {messages: 0, users: 0};

    if (localStorage.getItem(STORAGE_KEY) === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            currentMessage: "",
            userInfo: {
                name: "",
                email: ""
            }
        }));
    }

    let setupElements = function () {
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

        let userInfo = getUserInfo();
        this.$sendMessageText.value = getCurrentMessage();
        this.$fullName.value = userInfo.name;
        this.$email.value = userInfo.email;
        this.$loggedInLabel.innerText = "Hey " + (userInfo.name.length === 0 ? "Anonymous" : userInfo.name) + ", ";
        setLoginDialogVisibility(true);
    }.bind(this);

    let autoResizeTextArea = function () {
        this.$sendMessageText.addEventListener('keydown', autosize);

        function autosize() {
            let el = this;

            /*
                Using setTimeout to prevent keydown UI blocking.
             */
            setTimeout(function () {
                // set height auto to auto compute the scroll height
                el.style.cssText = 'height:auto; padding:0';
                let height = el.scrollHeight > 280 ? 280 : el.scrollHeight;
                height = height < 80 ? 80 : height;
                // height += 20;
                el.style.cssText = 'height:' + height + 'px';
            }, 0);
        }
    }.bind(this);

    let setLoginDialogVisibility = function (visible) {
        this.$loginDialog.style.cssText = visible ? "display:block" : "display:none";
        this.$logoutButton.style.cssText = visible ? "display:none" : "display:block";
        let userInfo = getUserInfo();
        this.$fullName.value = userInfo.name;
        this.$email.value = userInfo.email;
        this.$loggedInLabel.innerText = "Hey " + (userInfo.name.length === 0 ? "Anonymous" : userInfo.name) + ", ";
    }.bind(this);

    let setListeners = function () {

        this.$loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            Babble.register({name: this.$fullName.value, email: this.$email.value});
            setLoginDialogVisibility(false);
        }.bind(this));

        this.$loginForm.addEventListener("reset", function (e) {
            e.preventDefault();
            Babble.register({name: "", email: ""});
            setLoginDialogVisibility(false);
        }.bind(this));


        this.$logoutButton.addEventListener("click", function (e) {
            localStorage.clear();
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                currentMessage: "",
                userInfo: {
                    name: "",
                    email: ""
                }
            }));
            setLoginDialogVisibility(true);
        }.bind(this));


        this.$sendMessageText.addEventListener("keydown", function (e) {
            if (isShiftKey(e.keyCode)) {
                this.shiftKeyDown = true;
            }
        }.bind(this));
        this.$sendMessageText.addEventListener("keyup", function (e) {
            if (isShiftKey(e.keyCode)) {
                this.shiftKeyDown = false;
            }
            if (isEnterKey(e.keyCode) && !this.shiftKeyDown) {
                this.$sendMessageButton.click();
            }
            setCurrentMessage(e.target.value);
        }.bind(this));

        this.$sendMessageForm.addEventListener("submit", function (e) {
            e.preventDefault();

            if (this.$sendMessageText.value.trim().length === 0) {
                return;
            }

            let message = getUserInfo();
            message.name = message.name.length === 0 ? "Anonymous" : message.name;
            message["message"] = this.$sendMessageText.value;
            message["timestamp"] = new Date().getTime();

            console.log(message);

            this.$sendMessageText.isDisabled = true;
            this.$sendMessageText.value = "";
            this.$sendMessageText.style.cssText = 'height:80px';

            this.postMessage(message, function () {
                this.$sendMessageText.isDisabled = false;
                scrollTo(this.$messages.parentElement, this.$messages.parentElement.scrollHeight, 300);
            }.bind(this))

        }.bind(this));
    }.bind(this);


    function isShiftKey(code) {
        return code === 16;
    }

    function isEnterKey(code) {
        return code === 13;
    }


    function getHoursMinutes(timestamp) {
        let date = new Date(timestamp);
        let hours = date.getHours();
        let minutes = date.getMinutes();

        return hours + ":" + (minutes < 10 ? "0" : "") + minutes;
    }


    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    function scrollTo(element, to, duration) {
        let start = element.scrollTop, change = to - start, currentTime = 0, increment = 20;

        let animateScroll = function () {
            currentTime += increment;
            element.scrollTop = easeInOutQuad(currentTime, start, change, duration);
            if (currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    function getBabbleData() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
    }

    function getUserInfo() {
        return getBabbleData().userInfo;
    }

    function getCurrentMessage() {
        return getBabbleData().currentMessage;
    }

    function setCurrentMessage(message) {
        let babbleData = getBabbleData();
        babbleData.currentMessage = message;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(babbleData));
    }

    let longPollingMessages = function () {
        this.getMessages(this.messages.length, function (newMessages) {
            pushNewMessagesToDOM(newMessages);
            longPollingMessages();
        });
    }.bind(this);

    function notifyOnlineUsers() {
        request({method: "get", action: "online"}).then(function () {
            setTimeout(notifyOnlineUsers, 2000);
        }, function () {
            setTimeout(notifyOnlineUsers, 2000);
        });
    }

    let shortPullingStats = function () {
        this.getStats(function (data) {
            this.$messagesCount.innerText = data.messages + "";
            this.$usersCount.innerText = data.users + "";
            this.states = data;
            setTimeout(function () {
                shortPullingStats();
            }.bind(this), 1000)
        }.bind(this));
    }.bind(this);


    function request(options) {
        /* jshint -W098 */
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(options.method, BASE_URL + options.action);
            if (options.method === 'post') {
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
            xhr.addEventListener('load', e => {
                if (e.target.status !== 200) {
                    reject(e);
                    return;
                }
                resolve(e.target.responseText);
            });
            if (options.method === 'post') {
                xhr.send(options.data);
            } else {
                xhr.send();
            }
        });
    }


    let pushNewMessagesToDOM = function (msgs) {

        for (let i = 0; i < msgs.length; i++) {
            let msg = msgs[i];

            if (msg.deletedMessage) {
                let node = document.querySelector(".message[message-id='" + msg.id + "']");
                if (node !== null) {
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
            time.innerHTML = getHoursMinutes(msg.timestamp);
            time.setAttribute("datetime", new Date(msg.timestamp));

            let deleteButton = document.createElement("button");
            deleteButton.setAttribute("class", "delete-button");
            deleteButton.setAttribute("aria-label", "Delete Message");
            deleteButton.setAttribute("tabindex", "-1");
            deleteButton.setAttribute("message-id", msg.id);
            deleteButton.innerHTML = "x";

            deleteButton.addEventListener('click', function (e) {
                Babble.deleteMessage(msg.id, function () {
                    let elem = this;
                    elem.parentElement.parentElement.parentElement.parentElement
                        .removeChild(elem.parentElement.parentElement.parentElement);
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
            messageContent.setAttribute("tabindex", "0");

            messageContent.appendChild(topLayout);
            messageContent.appendChild(messageText);

            let msgDom = document.createElement("li");
            msgDom.setAttribute("class", "message");
            msgDom.appendChild(img);
            msgDom.appendChild(messageContent);
            msgDom.setAttribute("message-id", msg.id);

            this.$messages.appendChild(msgDom);
        }
    }.bind(this);

    this.register = function (userInfo) {
        let babbleData = getBabbleData();
        babbleData.userInfo = userInfo;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(babbleData));
    };

    this.getMessages = function (counter, callback) {
        console.log("getMessages(counter)", "counter = ", counter);

        request({method: "get", action: "messages?counter=" + encodeURI(counter)}).then(function (data) {

            data = JSON.parse(data);
            let newMessages = Message.loadArray(data);
            for (let i = 0; i < newMessages.length; i++) {
                if (newMessages[i].deletedMessage) {
                    this.messages = this.messages.slice(0, newMessages[i].id).concat(this.messages.slice(newMessages[i].id));
                } else {
                    this.messages.push(newMessages[i]);
                }
            }
            callback(newMessages);
        }.bind(this), function (error) {
            console.log("getMessages()", "Failed to get messages", error);
            alert("Failed to get messages");
        });
    };


    this.postMessage = function (message, callback) {
        console.log("postMessage(message, callback)", "message = ", message);

        request({method: "post", action: "messages", data: JSON.stringify(message)}).then(function (data) {
            callback(JSON.parse(data));
        }, function (error) {
            console.log("postMessage()", error);
            alert("Failed to post message");
            callback(null);
        });
    };

    this.deleteMessage = function (id, callback) {
        console.log("deleteMessage()", id);
        request({method: "delete", action: "messages/" + id}).then(function () {
            callback(true);
        }, function (error) {
            console.log("deleteMessage()", "Failed to delete message", error);
            alert("Failed to delete message");
            callback(false);
        });
    };
    this.getStats = function (callback) {
        console.log("getStats()");
        request({method: "get", action: "stats"}).then(function (data) {
            callback(JSON.parse(data));
        }, function (error) {
            console.log("getstats()", "Failed to get states", error);
            alert("Failed to get states");
        });
    };

    this.start = function () {
        setupElements();
        autoResizeTextArea();
        setListeners();
        longPollingMessages();
        notifyOnlineUsers();
        shortPullingStats();
    };
}();
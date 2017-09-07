const TAG = "App:";
const App = function () {
    console.log(TAG, "Start Chat App");

};


/*
    Register an event listener on key down in send message text area
    and compute the scroll height to auto resize to max 300px.
 */
App.prototype.autoResizeTextArea = function () {
    let textarea = document.querySelector('#sendMessageText');
    textarea.addEventListener('keydown', autosize);

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
App.prototype.run = function () {

    this.autoResizeTextArea();
};


(new App()).run();
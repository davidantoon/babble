Babble.http = new function () {

    const TAG = "Http";
    const BASE_URL = "http://localhost:9000/";


    this.post = function (url, data) {
        return request({method: "post", action: BASE_URL + url, data: JSON.stringify(data)});
    };

    this.get = function (url) {
        return request({method: "get", action: BASE_URL + url, data: JSON.stringify({})});
    };

    this.delete = function (url) {
        return request({method: "delete", action: BASE_URL + url, data: JSON.stringify({})});
    };

    function request(options) {
        /* jshint -W098 */
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open(options.method, options.action);
            if (options.method === 'post') {
                xhr.setRequestHeader('Content-Type', 'application/json');
            }
            xhr.addEventListener('load', e => {
                let res;
                try {
                    res = res = JSON.parse(e.target.responseText);
                } catch (e) {
                    res = res = e.target.responseText;
                }
                if (e.target.status !== 200 || (res.error !== null && res.error !== undefined)) {
                    resolve([null, res]);
                } else {
                    resolve([res, null]);
                }
            });
            xhr.send(options.data);
        });
    }
}();
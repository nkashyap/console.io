/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 14:24
 * To change this template use File | Settings | File Templates.
 */

window.ConsoleIOInject = (function () {

    "use strict";

    var domReady = false,
        onErrorHandler = window.onerror;

    function getServerParams() {
        var i = 0,
            script,
            src,
            params = {},
            scripts = Array.prototype.slice.call(
                document.scripts ?
                    document.scripts :
                    document.getElementsByName('script'));

        // get test info
        for (; !!(script = scripts[i++]);) {
            //TODO script.getAttribute possibility can be removed
            src = (script.src ? script.src : script.getAttribute('src')).toLowerCase();

            if (src.indexOf('inject.js') === -1) {
                continue;
            }

            params.secure = src.indexOf('https') > -1;
            var queryIndex = src.indexOf('?');
            if (queryIndex > -1) {
                var j = 0,
                    param,
                    queryParams = src.substring(queryIndex + 1, src.length).split('&');

                for (; !!(param = queryParams[j++]);) {
                    param = param.split('=');
                    params[param[0]] = param[1];
                }
            }

            if (!params.url) {
                var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im'),
                    url = queryIndex > -1 ? src.substring(0, queryIndex) : src;
                params.url = (params.secure ? 'https://' : 'http://') + url.match(re)[1].toString();
            }

            break;
        }

        // override test config from location
        if (location) {
            var origin = location.origin ? location.origin : location.protocol + '//' + location.hostname,
                hash = location.hash ? location.hash : location.href.replace(origin + location.pathname, '');

            if (hash && hash.length > 0) {
                var item,
                    z = 0,
                    hashItems = hash.split('#'),
                    length = hashItems.length;

                while (length > z) {
                    item = hashItems[z++];
                    if (!!item) {
                        var queryParam = item.split('=');
                        params[queryParam[0]] = queryParam[1];
                    }
                }
            }
        }

        return params;
    }

    function requireScript(url, callback) {
        var node = document.createElement('script'),
            head = document.getElementsByTagName('head')[0];

        node.type = 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;

        if (node.readyState === "complete") {
            setTimeout(function () {
                callback(url);
            }, 1);
        }

        function onScriptLoad() {
            if (node.attachEvent) {
                if (node.readyState === "complete") {
                    node.detachEvent('onreadystatechange', onScriptLoad);
                    callback(url);
                }
            } else {
                node.removeEventListener('load', onScriptLoad, false);
                callback(url);
            }
        }

        function onScriptError() {
            node.removeEventListener('error', onScriptError, false);
        }

        if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !window.opera) {
            node.attachEvent('onreadystatechange', onScriptLoad);
        } else {
            node.addEventListener('load', onScriptLoad, false);
            node.addEventListener('error', onScriptError, false);
        }

        // IE onload handler
        node.onload = onScriptLoad;
        node.src = url;
        head.appendChild(node);
    }

    function require(urls, callback) {
        if (typeof urls === 'string') {
            urls = [urls];
        }

        var i, url,
            length = urls.length,
            loadedScripts = {};

        function onScriptLoaded(scriptURL) {
            var finished = true;
            loadedScripts[scriptURL] = true;
            for (var fileURL in loadedScripts) {
                if (!loadedScripts[fileURL]) {
                    finished = false;
                }
            }

            if (finished) {
                callback();
            }
        }

        for (i = 0; i < length; i++) {
            url = urls[i];
            loadedScripts[url] = false;
            requireScript(url, onScriptLoaded);
        }
    }


    function ready(callback) {
        function DOMContentLoaded() {
            if (document.addEventListener) {
                document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                callback();
            } else if (document.attachEvent) {
                if (document.readyState === "complete") {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                    callback();
                }
            }
        }

        if (document.readyState === "complete") {
            setTimeout(callback, 1);
        }

        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
            window.addEventListener("load", callback, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", DOMContentLoaded);
            window.attachEvent("onload", callback);
        }
    }

    // Cover uncaught exceptions
    // Returning true will surpress the default browser handler,
    // returning false will let it run.
    function onErrorFn(error, filePath, lineNo) {
        var result = false;
        if (onErrorHandler) {
            result = onErrorHandler(error, filePath, lineNo);
        }

        // Treat return value as window.onerror itself does,
        // Only do our handling if not surpressed.
        if (result !== true) {
            if (typeof window.SocketIO !== 'undefined') {
                window.SocketIO.emit('error', {
                    message: error,
                    file: filePath,
                    line: lineNo
                });
            }
            return false;
        }

        return result;
    }

    function setUp(config) {
        ConsoleIO.extend(ConsoleIO, {
            require: require,
            ready: ready
        });

        //Hook into ConsoleIO API
        ConsoleIO.on('console', function (data) {
            window.SocketIO.emit('console', data);
        });

        window.SocketIO.init(config);
    }

    // Load required Scripts
    ready(function init() {
        if (domReady) {
            return;
        }
        domReady = true;

        var scripts = [],
            config = window.ConfigIO ? window.ConfigIO : getServerParams();

        // fix the ordering for Opera
        if (!window.io) {
            scripts.push(config.url + "/socket.io/socket.io.js");
        }
        // fix the samsung to load all script up front
        if (!window.ConsoleIO) {
            scripts.push(config.url + "/addons/console.io.js");
        }

        if (!window.SocketIO) {
            scripts.push(config.url + "/addons/socket.js");
        }

        if (config.web) {
            scripts.push(config.url + "/addons/web.js");
        }

        //Request console.io.js file to get connect.sid cookie from the server
        //Socket.io use connection cookie
        if(scripts.length > 0){
            require(scripts, function(){
                setUp(config);
            });
        }else{
            setUp(config);
        }
    });

    window.onerror = onErrorFn;

    return {
        require: require,
        ready: ready
    }
}());

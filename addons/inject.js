/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 14:24
 * To change this template use File | Settings | File Templates.
 */

window.InjectIO = (function () {

    "use strict";

    var domReady = false,
        onErrorHandler = window.onerror;

    /* COOKIES OBJECT */
    var Cookies = {
        // Initialize by splitting the array of Cookies
        init: function () {
            ConsoleIO.forEach(document.cookie.split('; '), function (cookie) {
                var cookiePair = cookie.split('=');
                this[cookiePair[0]] = cookiePair[1];
            }, this);
        },
        // Create Function: Pass name of cookie, value, and days to expire
        create: function (name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
            }
            else var expires = "";
            document.cookie = name + "=" + value + expires + "; path=/";
            this[name] = value;
        },
        // Erase cookie by name
        erase: function (name) {
            this.create(name, '', -1);
            this[name] = undefined;
        }
    };

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

    function isLoaded(url) {
        var tag = url.indexOf('.js') > -1 ? 'script' : url.indexOf('.css') > -1 ? 'link' : null,
            elements, element, attr, value, i = 0;

        if (tag) {
            attr = tag === 'script' ? 'src' : 'href';
            elements = document.getElementsByTagName(tag);
            for (; element = elements[i++];) {
                value = element.getAttribute(attr) || '';
                if (value.indexOf(url) > -1) {
                    return true;
                }
            }
        }

        return false;
    }

    function requireScript(url, callback) {

        if (isLoaded(url)) {
            setTimeout(function(){
                callback(url);
            }, 100);
            return false;
        }

        var node = document.createElement('script'),
            head = document.getElementsByTagName('head')[0];

        node.type = 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;

        //IEMobile readyState "loaded" instead of "complete"
        if (node.readyState === "complete" || node.readyState === "loaded") {
            setTimeout(function () {
                callback(url);
            }, 1);
        }

        function onScriptLoad() {
            if (node.removeEventListener) {
                node.removeEventListener('load', onScriptLoad, false);
                callback(url);

            } else if (node.attachEvent) {
                //IEMobile readyState "loaded" instead of "complete"
                if (node.readyState === "complete" || node.readyState === "loaded") {
                    node.detachEvent('onreadystatechange', onScriptLoad);
                    callback(url);
                }
            }
        }

        function onScriptError() {
            node.removeEventListener('error', onScriptError, false);
        }

        if (node.addEventListener) {
            node.addEventListener('load', onScriptLoad, false);
            node.addEventListener('error', onScriptError, false);

        } else if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !window.opera) {
            // IE onload handler, this will also cause callback to be called twice
            node.onload = onScriptLoad;
            node.attachEvent('onreadystatechange', onScriptLoad);
        }

        node.src = url;
        head.appendChild(node);
    }

    function requireStyle(url) {
        if (isLoaded(url)) {
            return false;
        }

        var link = document.createElement('link'),
            head = document.getElementsByTagName('head')[0];

        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.media = 'all';
        link.href = url;
        head.appendChild(link);
    }

    function remove(url) {
        var tag = url.indexOf('.js') > -1 ? 'script' : url.indexOf('.css') > -1 ? 'link' : null,
            elements, attr;

        if (tag) {
            attr = tag === 'script' ? 'src' : 'href';
            elements = document.getElementsByTagName(tag);
            ConsoleIO.forEach(ConsoleIO.toArray(elements), function (element) {
                if (element.getAttribute(attr).indexOf(url) > -1) {
                    element.parentNode.removeChild(element);
                }
            });
        }
    }

    function require(urls, callback) {
        if (typeof urls === 'string') {
            urls = [urls];
        }

        var i, url,
            finished = false,
            length = urls.length,
            loadedScripts = {};

        function onScriptLoaded(scriptURL) {
            var done = true;
            loadedScripts[scriptURL] = true;
            for (var fileURL in loadedScripts) {
                if (!loadedScripts[fileURL]) {
                    done = false;
                }
            }

            // In IE callback is called twice even though script is already loaded
            if (!finished && done) {
                finished = true;
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
        // Only do our handling if not suppressed.
        if (result !== true) {
            if (typeof window.SocketIO !== 'undefined' && window.SocketIO.isConnected()) {
                window.SocketIO.emit('console', {
                    type: 'error',
                    message: error + ';\nfileName: ' + filePath + ';\nlineNo: ' + lineNo
                });
            } else {
                debug([error, filePath, lineNo].join("; "));
            }
            return false;
        }

        return result;
    }

    function debug(msg) {
        var log = document.getElementById('log'), li;

        if (!log && document.body) {
            log = document.createElement('ul');
            log.setAttribute('id', 'log');
            document.body.insertBefore(log, document.body.firstElementChild || document.body.firstChild);
        }

        if (log) {
            li = document.createElement('li');
            li.innerHTML = msg;
            log.insertBefore(li, log.firstElementChild || log.firstChild);
        }
    }

    function setUp(config) {
        if (typeof window.ConsoleIO !== 'undefined') {
            Cookies.init();

            window.ConsoleIO.extend(window.ConsoleIO, {
                Cookies: Cookies,
                debug: debug,
                require: require,
                requireScript: requireScript,
                requireStyle: requireStyle,
                remove: remove,
                ready: ready
            });

            //Hook into ConsoleIO API
            if (window.SocketIO) {
                window.SocketIO.init(config);
            }

            if (window.WebIO) {
                window.WebIO.init(config);
            }

        } else {
            debug("Console.IO dependencies are missing!" +
                " If you are using inject.js to load dependencies" +
                " then it is possible that your browser doesn't support" +
                " dynamic script injection. Please include all files explicitly");
        }
    }

    // Load required Scripts
    ready(function init() {
        if (domReady) {
            return;
        }
        domReady = true;

        var scripts = [],
            config = typeof window.ConfigIO !== 'undefined' ? window.ConfigIO : getServerParams();

        // fix the ordering for Opera
        scripts.push(config.url + "/socket.io/socket.io.js");

        // fix the samsung to load all script up front
        scripts.push(config.url + "/addons/console.io.js");
        scripts.push(config.url + "/addons/socket.js");

        if (config.web) {
            scripts.push(config.url + "/addons/web.js");
            requireStyle(config.url + "/resources/console.css");
        }

        //Request console.io.js file to get connect.sid cookie from the server
        //Socket.io use connection cookie
        if (scripts.length > 0) {
            require(scripts, function () {
                setUp(config);
            });
        } else {
            setUp(config);
        }
    });

    window.onerror = onErrorFn;

    return {
        debug: debug,
        require: require,
        ready: ready
    };
}());

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
        onErrorHandler = window.onerror,
        Storage;

    /* Storage OBJECT */
    Storage = (function () {
        var memory = {};

        function add(name, value, days, skipLocalStorage) {
            if (!value || value === 'undefined') {
                return;
            }

            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            }

            document.cookie = name + "=" + value + expires + "; path=/";
            memory[name] = value;

            if (!skipLocalStorage && window.localStorage) {
                window.localStorage.setItem(name, value);
            }
        }

        function remove(name) {
            add(name, '', -1, true);
            delete memory[name];
            if (window.localStorage) {
                window.localStorage.removeItem(name);
            }
        }

        function get(name) {
            if (window.localStorage) {
                return window.localStorage.getItem(name) || memory[name];
            }
            return memory[name];
        }

        function setUp() {
            var i, cookie, key, value,
                cookies = document.cookie.split('; '),
                length = cookies.length;

            for (i = 0; i < length; i++) {
                cookie = cookies[i].split('=');

                key = cookie[0];
                value = cookie[1];

                memory[key] = value;

                if (window.localStorage) {
                    if (!window.localStorage.getItem(key)) {
                        window.localStorage.setItem(key, value);
                    }
                }
            }

            // override cookie with localstorage value
            if (window.localStorage) {
                var guid = window.localStorage.getItem('guid'),
                    deviceName = window.localStorage.getItem('deviceName');

                if (guid && !memory.guid) {
                    add('guid', guid, 365, true);
                }

                if (deviceName && !memory.deviceName) {
                    add('deviceName', deviceName, 365, true);
                }
            }
        }

        return {
            add: add,
            remove: remove,
            get: get,
            setUp: setUp
        };

    }());

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
            src = (script.src ? script.src : (script.getAttribute('src') || '')).toLowerCase();

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

            if (!params.base) {
                params.base = src.indexOf('/console.io/') > -1 ? 'console.io/' : '';
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
            setTimeout(function () {
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
                var path = element.getAttribute(attr) || '';
                if (path.indexOf(url) > -1) {
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
        if (typeof window.SocketIO !== 'undefined' && window.SocketIO.isConnected()) {
            window.SocketIO.emit('console', {
                type: 'error',
                message: error + ';\nfileName: ' + filePath + ';\nlineNo: ' + lineNo
            });
        } else if (isChildWindow()) {
            console.exception(error + ';\nfileName: ' + filePath + ';\nlineNo: ' + lineNo);
        } else {
            debug([error, filePath, lineNo].join("; "));
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
            Storage.setUp();

            window.ConsoleIO.extend(window.ConsoleIO, {
                Storage: Storage,
                debug: debug,
                require: require,
                requireScript: requireScript,
                requireStyle: requireStyle,
                remove: remove,
                ready: ready
            });

            if (window.SocketIO && config.socket) {
                window.SocketIO.init(config);
            }

            if (window.WebIO && config.web) {
                window.WebIO.init(config);
            }

            if (!window.SocketIO && isChildWindow()) {
                if (window.parent.postMessage) {
                    ConsoleIO.on('console', function (data) {
                        window.parent.postMessage({
                            event: 'console',
                            type: data.type,
                            message: escape(data.message),
                            stack: data.stack
                        }, "*");
                    });
                } else {
                    console.log('window.parent.postMessage not supported');
                }
            }

            /**
             * override samsung maple logging
             */
            if (navigator.userAgent.search(/Maple/i) > -1) {
                window.alert = window.console.info;
            }
        } else {
            debug("Console.IO dependencies are missing!" +
                " If you are using inject.js to load dependencies" +
                " then it is possible that your browser doesn't support" +
                " dynamic script injection. Please include all files explicitly");
        }
    }

    function getUrl(config) {
        return config.url + (config.base ? '/' + config.base : '/');
    }

    function getConfig() {
        var config = window.ConfigIO || getServerParams();

        config.socket = config.socket == true || typeof config.socket === 'undefined';
        config.web = config.web === true || config.web == 'true';

        return config;
    }

    function isChildWindow() {
        return window.location !== window.parent.location;
    }

    window.onerror = onErrorFn;

    /**
     * Maple browser fix
     * Maple has interface for both addEventListener and attachEvent
     * but attachEvent is not fully implemented so it never raise any event
     *
     * set it to undefined to force other libraries to use addEventListener instead
     */
    if (navigator.userAgent.search(/Maple/i) > -1 &&
        typeof HTMLElement.prototype.addEventListener === 'function' &&
        typeof HTMLElement.prototype.attachEvent === 'function') {

        HTMLElement.prototype.attachEvent = undefined;
    }

    // Load required Scripts
    ready(function init() {
        if (domReady) {
            return;
        }
        domReady = true;

        var config = getConfig(),
            scripts = [];

        if (!window.ConsoleIO) {
            scripts.push(getUrl(config) + "addons/console.js");
        }

        if (!isChildWindow()) {
            if (config.socket) {
                if (!window.io) {
                    scripts.push(getUrl(config) + "socket.io/socket.io.js");
                }

                if (!window.SocketIO) {
                    scripts.push(getUrl(config) + "addons/socket.js");
                }
            }

            if (!window.WebIO && config.web) {
                scripts.push(getUrl(config) + "addons/web.js");
                requireStyle(getUrl(config) + "resources/console.css");
            }
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

        // Setup RequireJS global error handler
        if (typeof window.requirejs !== 'undefined') {
            window.requirejs.onError = function (error) {
                console.error(error, error.requireModules, error.originalError);
            };
        }

        if (window.onerror !== onErrorFn) {
            onErrorHandler = window.onerror
            window.onerror = onErrorFn;
        }
    });

    return {
        getUrl: getUrl,
        debug: debug,
        require: require,
        ready: ready
    };
}());

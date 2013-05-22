/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 14:24
 * To change this template use File | Settings | File Templates.
 */

(function () {

    "use strict";

    var Socket,
        domReady = false;

    Socket = {
        io: null,
        //name: null,
        config: null,
        forceReconnection: true,
        forceReconnectInterval: 5000,
        setInterval: null,
        subscribed: false,
        connectionMode: null,
        pending: [],

        init: function init(config) {
            this.config = config;
            this.io = window.io.connect(config.url, { secure: (config.secure == 'true') });

            // Fix for old Opera and Maple browsers
            (function overrideJsonPolling(io) {
                var original = io.Transport["jsonp-polling"].prototype.post;
                io.Transport["jsonp-polling"].prototype.post = function (data) {
                    var scope = this;
                    original.call(this, data);
                    setTimeout(function () {
                        scope.socket.setBuffer(false);
                    }, 250);
                };
            }(window.io));

            // set events
            this.io.on('connect', this.onConnect);
            this.io.on('connecting', this.onConnecting);
            this.io.on('reconnect', this.onReconnect);
            this.io.on('reconnecting', this.onReconnecting);
            this.io.on('disconnect', this.onDisconnect);
            this.io.on('connect_failed', this.onConnectFailed);
            this.io.on('reconnect_failed', this.onReconnectFailed);
            this.io.on('error', this.onError);
            this.io.on('device:ready', this.onReady);
            //this.io.on('unsubscribe', this.onUnSubscribe);
            this.io.on('device:command', this.onCommand);
            this.io.on('device:filelist', this.onFileList);
        },

        emit: function emit(name, data) {
            if (this.io && this.io.socket.connected) {
                //data.name = this.name;
                this.io.emit('device:' + name, data);
            } else {
                this.pending.push({ name: name, data: data });
            }
        },

        forceReconnect: function forceReconnect() {
            if (this.forceReconnection && !this.setInterval) {
                this.setInterval = window.setInterval(function () {
                    if (!Socket.io.socket.connected || (Socket.io.socket.connected && !Socket.subscribed)) {
                        Socket.io.socket.disconnect();
                        Socket.io.socket.reconnect();
                    }
                }, this.forceReconnectInterval);
            }
        },

        onConnect: function onConnect() {
            console.log('Connected to the Server');

            var navigator = window.navigator;
            Socket.emit('setUp', {
                userAgent: navigator.userAgent,
                appVersion: navigator.appVersion,
                vendor: navigator.vendor,
                platform: navigator.platform,
                opera: !!window.opera,
                params: Socket.config
            });
        },

        onConnecting: function onConnecting(mode) {
            Socket.connectionMode = mode;
            console.log('Connecting to the Server');
        },

        onReconnect: function onReconnect(mode, attempts) {
            Socket.connectionMode = mode;
            console.log('Reconnected to the Server after' + attempts + ' attempts.');
        },

        onReconnecting: function onReconnecting() {
            console.log('Reconnecting to the Server');
        },

        onDisconnect: function onDisconnect() {
            console.log('Disconnected from the Server');
        },

        onConnectFailed: function onConnectFailed() {
            console.warn('Failed to connect to the Server');
        },

        onReconnectFailed: function onReconnectFailed() {
            console.warn('Failed to reconnect to the Server');
        },

        onError: function onError() {
            console.warn('Socket Error');
        },

        onReady: function onReady(data) {
            //Socket.name = data.guid;
            Socket.subscribed = true;

            showName(data.name + '|' + data.guid);
            console.log('Subscribed to', data.guid);

            ConsoleIO.forEach(Socket.pending, function (item) {
                Socket.emit(item.name, item.data);
            });
            Socket.pending = [];

            Socket.forceReconnect();
        },

        //onUnSubscribe: function onUnSubscribe(data) {
            //console.log('UnSubscribed from', Socket.name);
            //Socket.subscribed = false;
        //},

        onFileList: function onFileList() {
            var scripts = [],
                styles = [],
                origin = location.origin + '/';

            ConsoleIO.forEach(ConsoleIO.toArray(document.scripts), function(script){
                if(script.src){
                    scripts.push(script.src.replace(origin,""));
                }
            });

            if(scripts.length > 0){
                Socket.emit('files', {
                    type: 'javascript',
                    files: scripts
                });
            }

            ConsoleIO.forEach(ConsoleIO.toArray(document.getElementsByTagName('link')), function(style){
                if(style.href){
                    styles.push(style.href.replace(origin,""));
                }
            });

            if(styles.length > 0){
                Socket.emit('files', {
                    type: 'style',
                    files: styles
                });
            }
        },

        onCommand: function onCommand(cmd) {
            var evalFun, result;
            try {
                //Function first argument is Deprecated
                evalFun = new Function([], "return " + cmd);
                result = evalFun();
                if (result) {
                    console.command(result);
                }
            } catch (e) {
                if (evalFun && evalFun.toString()) {
                    console.error(e, evalFun.toString());
                } else {
                    console.error(e);
                }
            }
        }
    };

    function showName(content) {
        var className = "console-content",
            styleId = "device-style";

        if (!document.getElementById(styleId)) {
            var css =   "." + className + "::after { content: '" + content +
                    "'; position: fixed; top: 0px; left: 0px; padding: 2px 8px; " +
                    "font-size: 12px; font-weight: bold; color: rgb(111, 114, 117); " +
                    "background-color: rgba(192, 192, 192, 0.5); border: 1px solid rgb(111, 114, 117); " +
                    "font-family: Monaco,Menlo,Consolas,'Courier New',monospace; };",
                head = document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            style.id = styleId;

            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);
        }

        (document.body.firstElementChild || document.body.firstChild).setAttribute("class", className);
    }

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

    function require(url, callback) {
        var node = document.createElement('script'),
            head = document.getElementsByTagName('head')[0];

        node.type = 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;

        if (node.readyState === "complete") {
            setTimeout(callback, 1);
        }

        function onScriptLoad() {
            if (node.attachEvent) {
                if (node.readyState === "complete") {
                    node.detachEvent('onreadystatechange', onScriptLoad);
                }
            } else {
                node.removeEventListener('load', onScriptLoad, false);
            }

            callback();
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

        node.src = url;
        head.appendChild(node);
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

    // Preserve other handlers
    var onErrorHandler = window.onerror;

    // Cover uncaught exceptions
    // Returning true will surpress the default browser handler,
    // returning false will let it run.
    window.onerror = function onErrorFn(error, filePath, lineNo) {
        var result = false;
        if (onErrorHandler) {
            result = onErrorHandler(error, filePath, lineNo);
        }

        // Treat return value as window.onerror itself does,
        // Only do our handling if not surpressed.
        if (result !== true) {
            Socket.emit("error", {
                message: error,
                file: filePath,
                line: lineNo
            });
            return false;
        }

        return result;
    };

    // Load Socket.io
    ready(function init() {
        if (domReady) {
            return;
        }
        domReady = true;

        var config = getServerParams();

        //Request console.io.js file to get connect.sid cookie from the server
        //Socket.io use connection cookie
        require(config.url + "/addons/console.io.js", function () {

            ConsoleIO.extend(ConsoleIO, {
                require: require,
                ready: ready
            });

            require(config.url + "/socket.io/socket.io.js", function () {

                Socket.init(config);

                //Hook into ConsoleIO API
                ConsoleIO.on('console', function (data) {
                    Socket.emit('console', data);
                });
            });
        });
    });
}());
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 14:24
 * To change this template use File | Settings | File Templates.
 */

window.SocketIO = (function () {

    "use strict";

    var Socket = {
        io: null,
        name: null,
        guid: null,
        config: null,
        forceReconnection: true,
        forceReconnectInterval: 5000,
        setInterval: null,
        subscribed: false,
        connectionMode: null,
        pending: [],

        init: function init(config) {
            this.config = config;
            this.io = window.io.connect(config.url, { secure: (typeof config.secure === 'boolean' ? config.secure : config.secure == 'true') });

            // set console.io event
            ConsoleIO.on('console', function (data) {
                Socket.emit('console', data);
            });

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
            this.io.on('device:online', this.onOnline);
            this.io.on('device:offline', this.onOffline);
            this.io.on('device:command', this.onCommand);
            this.io.on('device:fileList', this.onFileList);
            this.io.on('device:htmlContent', this.onHTMLContent);
            this.io.on('device:fileSource', this.onFileSource);
            this.io.on('device:previewHTML', this.onPreview);
            this.io.on('device:captureScreen', this.onCaptureScreen);
            this.io.on('device:status', this.onStatus);
            this.io.on('device:reload', this.onReload);
            this.io.on('device:plugin', this.onPlugin);
            this.io.on('device:name', this.onName);
        },

        emit: function emit(name, data) {
            if (this.io && this.io.socket.connected) {
                this.io.emit('device:' + name, data);
                return true;
            } else {
                this.pending.push({ name: name, data: data });
                return false;
            }
        },

        on: function on(name, callback, scope) {
            if (this.io) {
                this.io.on(name, function () {
                    callback.apply(scope || this, arguments);
                });
            }
        },

        forceReconnect: function forceReconnect() {
            if (!this.forceReconnection || this.setInterval) {
                return false;
            }

            this.setInterval = window.setInterval(function () {
                if (!Socket.io.socket.connected || (Socket.io.socket.connected && !Socket.subscribed)) {
                    console.log('forceReconnect reconnecting', Socket.name);
                    Socket.io.socket.disconnect();
                    Socket.io.socket.reconnect();
                    window.clearInterval(Socket.setInterval);
                    Socket.setInterval = null;
                }
            }, this.forceReconnectInterval);
        },

        clearPendingQueue: function clearPendingQueue() {
            var queue = [];
            ConsoleIO.forEach(Socket.pending, function (item) {
                var state = Socket.emit(item.name, item.data);
                if (!state) {
                    queue.push(item);
                }
            });
            Socket.pending = queue;
        },

        isConnected: function isConnected() {
            return Socket.io && Socket.io.socket ? Socket.io.socket.connected : false;
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

            Socket.forceReconnect();
        },

        onConnecting: function onConnecting(mode) {
            Socket.connectionMode = mode;
            console.log('Connecting to the Server');
        },

        onReconnect: function onReconnect(mode, attempts) {
            Socket.connectionMode = mode;
            Socket.subscribed = true;
            Socket.clearPendingQueue();
            console.log('Reconnected to the Server after ' + attempts + ' attempts.');
            Socket.forceReconnect();
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
            Socket.name = data.name;
            Socket.guid = data.guid;

            ConsoleIO.Cookies.create("deviceName", data.name, 365);
            showName(data.name + '|' + data.guid);
            console.log('Ready', Socket.name);

            Socket.forceReconnect();
        },

        onOnline: function onOnline(data) {
            if (!Socket.guid) {
                Socket.name = data.name;
                Socket.guid = data.guid;
                showName(data.name + '|' + data.guid);
            }

            if (data.guid === Socket.guid) {
                Socket.subscribed = true;
                Socket.clearPendingQueue();
                console.log('Online', Socket.name);
            }

            Socket.forceReconnect();
        },

        onOffline: function onOffline(data) {
            if (!Socket.guid) {
                Socket.name = data.name;
                Socket.guid = data.guid;
                showName(data.name + '|' + data.guid);
            }

            if (data.guid === Socket.guid) {
                console.log('Offline', Socket.name);
                Socket.subscribed = false;
            }
        },

        onName: function onName(data) {
            if (!data.name) {
                ConsoleIO.Cookies.erase('deviceName');
            }

            Socket.name = data.name;
            ConsoleIO.Cookies.create('deviceName', Socket.name, 365);
            document.getElementById("device-style").parentNode.removeChild(document.getElementById("device-style"));
            showName(data.name + '|' + data.guid);
        },

        onStatus: function onStatus() {
            Socket.emit('status', {
                connection: {
                    mode: Socket.connectionMode
                },
                document: {
                    cookie: document.cookie
                },
                navigator: getBrowserInfo(window.navigator),
                location: getBrowserInfo(window.location),
                screen: getBrowserInfo(window.screen)
            });
        },

        onFileSource: function onFileSource(data) {
            var xmlhttp = getXMLHttp();
            if (xmlhttp) {
                xmlhttp.open("GET", data.url, true);
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState === 4) {
                        var content;
                        if (xmlhttp.status === 200) {
                            content = xmlhttp.responseText;
                        } else {
                            content = xmlhttp.statusText;
                        }

                        Socket.emit('source', { url: data.url, content: content });
                    }
                };
                //xmlhttp.onload  = function (e) { ConsoleIO.native.log('onload',e); };
                xmlhttp.onerror = function (e) {
                    Socket.emit('source', { url: data.url, content: 'XMLHttpRequest Error: Possibally Access-Control-Allow-Origin security issue.' });
                };
                xmlhttp.send(null);
            } else {
                Socket.emit('source', { url: data.url, content: 'XMLHttpRequest request not supported by the browser.' });
            }
        },

        onReload: function onReload() {
            console.log('executing reload command');
            setTimeout((function (url) {
                return function () {
                    if (window.location.reload) {
                        window.location.reload(true);
                    } else {
                        window.location.assign(url);
                    }
                };
            }(location.href)), 500);
        },

        onPlugin: function onPlugin(data) {
            if (data.WebIO) {
                if (!window.WebIO && data.WebIO.enabled) {
                    ConsoleIO.requireStyle(Socket.config.url + "/resources/console.css");
                    ConsoleIO.requireScript(Socket.config.url + "/addons/web.js", function () {
                        var config = ConsoleIO.extend({}, Socket.config);
                        window.WebIO.init(ConsoleIO.extend(config, data.WebIO));
                    });
                } else if (window.WebIO && !data.WebIO.enabled) {
                    window.WebIO = window.WebIO.destroy();
                    ConsoleIO.remove("resources/console.css");
                    ConsoleIO.remove("addons/web.js");
                }
            }
        },

        onHTMLContent: function onHTMLContent() {
            var parentNode,
                webLog = document.getElementById('console-log');

            if (webLog) {
                parentNode = webLog.parentNode;
                parentNode.removeChild(webLog);
            }

            Socket.emit('content', { content: document.documentElement.innerHTML });

            if (webLog) {
                parentNode.appendChild(webLog);
            }
        },

        onPreview: function onPreview() {
            var parentNode, preview,
                webLog = document.getElementById('console-log');

            if (webLog) {
                parentNode = webLog.parentNode;
                parentNode.removeChild(webLog);
            }

            preview = '<html><head><style type="text/css">' +
                getStyleRule() + '</style></head>' +
                getStyledElement().outerHTML + '</html>';

            Socket.emit('previewContent', { content: preview });

            if (webLog) {
                parentNode.appendChild(webLog);
            }
        },

        onCaptureScreen: function onCaptureScreen() {
            window.ConsoleIO.requireScript(Socket.config.url + "/addons/html2canvas.js", function () {
                var parentNode,
                    webLog = document.getElementById('console-log');

                if (webLog) {
                    parentNode = webLog.parentNode;
                    parentNode.removeChild(webLog);
                }

                window.html2canvas(document.body, {
                    logging: true,
                    onrendered: function (canvas) {
                        Socket.emit('screenShot', { screen: canvas.toDataURL() });
                        if (webLog) {
                            parentNode.appendChild(webLog);
                        }
                    }
                });
            });
        },

        onFileList: function onFileList() {
            var scripts = [],
                styles = [],
                origin = (location.origin || location.href.replace(location.pathname, ""));

            ConsoleIO.forEach(ConsoleIO.toArray(document.scripts), function (script) {
                if (script.src) {
                    scripts.push(script.src.replace(origin, ""));
                }
            });

            if (scripts.length > 0) {
                Socket.emit('files', {
                    type: 'javascript',
                    files: scripts
                });
            }

            ConsoleIO.forEach(ConsoleIO.toArray(document.getElementsByTagName('link')), function (style) {
                if (style.href) {
                    styles.push(style.href.replace(origin, ""));
                }
            });

            if (styles.length > 0) {
                Socket.emit('files', {
                    type: 'style',
                    files: styles
                });
            }
        },

        onCommand: function onCommand(cmd) {
            console.log('executing script');
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

    function getStyleRule() {
        var styleText = [],
            regex = new RegExp("((http|https)://)?([^/]+)", 'img');

        ConsoleIO.forEach(ConsoleIO.toArray(document.styleSheets), function (style) {
            try {
                var rules = style.cssRules || style.rules,
                    href = style.href.match(regex);

                href.pop();

                if (rules) {
                    ConsoleIO.forEach(ConsoleIO.toArray(rules), function (styleRule) {
                        var cssText = styleRule.cssText,
                            baseURL = href.concat();

                        if (cssText) {
                            //TODO this only check only for 1 level up
                            if (cssText.indexOf("../") > -1) {
                                baseURL.pop();
                                cssText = cssText.replace("..", baseURL.join("/"));
                            }

                            styleText.push(cssText);
                        }
                    });
                }
            } catch (e) {
            }
        });
        return styleText.join(" ");
    }

    function getStyledElement(element, clone) {
        element = element || document.body;
        clone = clone || element.cloneNode(true);

        ConsoleIO.forEach(ConsoleIO.toArray(element.children), function (child, index) {
            getStyledElement(child, clone.children[index]);
        });

        clone.setAttribute('style', (element.style.display !== 'none') ? getAppliedStyles(element) : 'display:none;');

        return clone;
    }

    function getAppliedStyles(element) {
        var win = document.defaultView || window,
            styleNode = [];

        if (win.getComputedStyle) {
            /* Modern browsers */
            var styles = win.getComputedStyle(element, '');
            ConsoleIO.forEach(ConsoleIO.toArray(styles), function (style) {
                styleNode.push(style + ':' + styles.getPropertyValue(style));
            });

        } else if (element.currentStyle) {
            /* IE */
            ConsoleIO.forEachProperty(element.currentStyle, function (value, style) {
                styleNode.push(style + ':' + value);
            });

        } else {
            /* Ancient browser..*/
            ConsoleIO.forEach(ConsoleIO.toArray(element.style), function (style) {
                styleNode.push(style + ':' + element.style[style]);
            });
        }

        return styleNode.join("; ");
    }

    function getBrowserInfo(obj) {
        var returnObj = { More: [] },
            dataTypes = [
                '[object Arguments]', '[object Array]',
                '[object String]', '[object Number]', '[object Boolean]',
                '[object Error]', '[object ErrorEvent]',
                '[object Object]'
            ];

        ConsoleIO.forEachProperty(obj, function (value, property) {
            if (dataTypes.indexOf(ConsoleIO.getObjectType(value)) > -1) {
                returnObj[property] = ConsoleIO.Stringify.parse(value);
            } else {
                returnObj.More.push(property);
            }
        });

        return returnObj;
    }

    function getXMLHttp() {
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
            // throw error in smart TV browsers
            try {
                xhr.withCredentials = false;
            } catch (e) {
            }

        } else if (window.XDomainRequest) {
            xhr = new XDomainRequest();
        } else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return xhr;
    }

    function showName(content) {
        var className = "console-content",
            styleId = "device-style";

        if (!document.getElementById(styleId)) {
            var css = "." + className + "::after { content: 'Console.IO:" + content +
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

    return Socket;
}());
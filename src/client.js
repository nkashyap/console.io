/**
 * Client
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 *
 */

(function (exports, global) {

    var client = exports.client = {};

    function displayName(content) {
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

    function setData(data) {
        if (!exports.guid) {
            exports.guid = data.guid;

            exports.storage.addItem("guid", data.guid, 365);
        }

        if (!exports.name) {
            exports.name = data.name;
            exports.storage.addItem("deviceName", data.name, 365);
        }

        displayName(exports.name + '|' + exports.guid);
    }

    function addFunctionBindSupport() {
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== "function") {
                    // closest thing possible to the ECMAScript 5 internal IsCallable function
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    fNOP = function () {
                    },
                    fBound = function () {
                        return fToBind.apply(this instanceof fNOP && oThis
                            ? this
                            : oThis,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();

                return fBound;
            };
        }
    }

    function getStyleRule() {
        var styleText = [],
            regex = new RegExp("((http|https)://)?([^/]+)", 'img');

        exports.util.forEach(exports.util.toArray(document.styleSheets), function (style) {
            try {
                var rules = style.cssRules || style.rules,
                    href = style.href.match(regex);

                href.pop();

                if (rules) {
                    exports.util.forEach(exports.util.toArray(rules), function (styleRule) {
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

        exports.util.forEach(exports.util.toArray(element.children), function (child, index) {
            getStyledElement(child, clone.children[index]);
        });

        clone.setAttribute('style', (element.style.display !== 'none') ? getAppliedStyles(element) : 'display:none;');

        return clone;
    }

    function getAppliedStyles(element) {
        var win = document.defaultView || global,
            styleNode = [];

        if (win.getComputedStyle) {
            /* Modern browsers */
            var styles = win.getComputedStyle(element, '');
            exports.util.forEach(exports.util.toArray(styles), function (style) {
                styleNode.push(style + ':' + styles.getPropertyValue(style));
            });

        } else if (element.currentStyle) {
            /* IE */
            exports.util.forEachProperty(element.currentStyle, function (value, style) {
                styleNode.push(style + ':' + value);
            });

        } else {
            /* Ancient browser..*/
            exports.util.forEach(exports.util.toArray(element.style), function (style) {
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

        exports.util.forEachProperty(obj, function (value, property) {
            if (dataTypes.indexOf(exports.util.getObjectType(value)) > -1) {
                returnObj[property] = exports.stringify.parse(value);
            } else {
                returnObj.More.push(property);
            }
        });

        return returnObj;
    }

    function getXMLHttp() {
        var xhr;
        if (global.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
            // throw error in smart TV browsers
            try {
                xhr.withCredentials = false;
            } catch (e) {
            }

        } else if (global.XDomainRequest) {
            xhr = new XDomainRequest();
        } else if (global.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return xhr;
    }


    function onReady(data) {
        setData(data);

        exports.console.log('Ready', exports.name);
        exports.transport.forceReconnect();
    }

    function onOnline(data) {
        setData(data);

        if (data.guid === exports.guid) {
            exports.transport.subscribed = true;
            exports.transport.clearPendingQueue();

            exports.console.log('Online', exports.name);
        }

        exports.transport.forceReconnect();
    }

    function onOffline(data) {
        setData(data);

        if (data.guid === exports.guid) {
            exports.console.log('Offline', exports.name);
            exports.transport.subscribed = false;
        }
    }

    function onName(data) {
        if (!data.name) {
            exports.storage.removeItem('deviceName');
        }

        exports.name = data.name;
        exports.storage.addItem('deviceName', exports.name, 365);

        document.getElementById("device-style").parentNode.removeChild(document.getElementById("device-style"));

        displayName(exports.name + '|' + exports.guid);
    }

    function onStatus() {
        exports.transport.emit('status', {
            connection: {
                mode: exports.transport.connectionMode
            },
            document: {
                cookie: document.cookie
            },
            navigator: getBrowserInfo(global.navigator),
            location: getBrowserInfo(global.location),
            screen: getBrowserInfo(global.screen)
        });
    }

    function onFileSource(data) {
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

                    exports.transport.emit('source', { url: data.url, content: content });
                }
            };

            //xmlhttp.onload  = function (e) { ConsoleIO.native.log('onload',e); };
            xmlhttp.onerror = function (e) {
                exports.transport.emit('source', { url: data.url, content: 'XMLHttpRequest Error: Possibally Access-Control-Allow-Origin security issue.' });
            };

            xmlhttp.send(null);
        } else {
            exports.transport.emit('source', { url: data.url, content: 'XMLHttpRequest request not supported by the browser.' });
        }
    }

    function onReload() {

        exports.console.log('executing reload command');

        global.setTimeout((function (url) {
            return function () {
                if (global.location.reload) {
                    global.location.reload(true);
                } else {
                    global.location.assign(url);
                }
            };
        }(location.href)), 500);
    }

    function onPlugin(data) {
//        if (data.WebIO) {
//            if (!global.WebIO && data.WebIO.enabled) {
//                var url = exports.util.getUrl(exports.config);
//
//                exports.util.requireCSS(url + "resources/console.css");
//                exports.util.requireScript(url + "addons/web.js", function () {
//                    var config = exports.util.extend({}, exports.config);
//
//                    global.WebIO.init(exports.util.extend(config, data.WebIO));
//                });
//
//            } else if (global.WebIO && !data.WebIO.enabled) {
//                global.WebIO = global.WebIO.destroy();
//                exports.util.removeFile("resources/console.css");
//                exports.util.removeFile("addons/web.js");
//            }
//        }
    }

    function onHTMLContent() {
        var parentNode,
            webLog = document.getElementById('console-log');

        if (webLog) {
            parentNode = webLog.parentNode;
            parentNode.removeChild(webLog);
        }

        exports.transport.emit('content', { content: document.documentElement.innerHTML });

        if (webLog) {
            parentNode.appendChild(webLog);
        }
    }

    function onPreview() {
        var parentNode, preview,
            webLog = document.getElementById('console-log');

        if (webLog) {
            parentNode = webLog.parentNode;
            parentNode.removeChild(webLog);
        }

        preview = '<html><head><style type="text/css">' +
            getStyleRule() + '</style></head>' +
            getStyledElement().outerHTML + '</html>';

        exports.transport.emit('previewContent', { content: preview });

        if (webLog) {
            parentNode.appendChild(webLog);
        }
    }

    function onCaptureScreen() {
        addFunctionBindSupport();

        var url = exports.util.getUrl(exports.config);

        exports.util.requireScript(url + exports.config.html2canvas, function () {
            var parentNode,
                webLog = document.getElementById('console-log');

            if (webLog) {
                parentNode = webLog.parentNode;
                parentNode.removeChild(webLog);
            }

            global.html2canvas(document.body, {
                completed: false,
                logging: true,
                useCORS: true,
                proxy: url + 'proxy',
                onrendered: function (canvas) {
                    if (!this.completed) {
                        try {
                            this.completed = true;
                            exports.transport.emit('screenShot', { screen: canvas.toDataURL() });
                        } catch (e) {
                            exports.transport.emit('screenShot', { screen: false });
                            exports.console.exception(e);
                        }
                    }

                    if (webLog) {
                        parentNode.appendChild(webLog);
                    }
                }
            });
        });
    }

    function onFileList() {
        var scripts = [],
            styles = [],
            origin = (global.location.origin || global.location.href.replace(global.location.pathname, ""));

        exports.util.forEach(exports.util.toArray(document.scripts), function (script) {
            if (script.src) {
                scripts.push(script.src.replace(origin, ""));
            }
        });

        if (scripts.length > 0) {
            exports.transport.emit('files', {
                type: 'javascript',
                files: scripts
            });
        }

        exports.util.forEach(exports.util.toArray(document.getElementsByTagName('link')), function (style) {
            if (style.href) {
                styles.push(style.href.replace(origin, ""));
            }
        });

        if (styles.length > 0) {
            exports.transport.emit('files', {
                type: 'style',
                files: styles
            });
        }
    }

    function onCommand(cmd) {
        exports.console.log('executing script');

        var evalFun, result;
        try {
            //Function first argument is Deprecated
            evalFun = new Function([], "return " + cmd);
            result = evalFun();
            if (result) {
                exports.console.command(result);
            }
        } catch (e) {
            exports.console.error(e, (evalFun && evalFun.toString) ? evalFun.toString() : undefined);
        }
    }


    client.setUp = function setUp() {
        exports.transport.on('device:ready', onReady);
        exports.transport.on('device:online', onOnline);
        exports.transport.on('device:offline', onOffline);
        exports.transport.on('device:command', onCommand);
        exports.transport.on('device:fileList', onFileList);
        exports.transport.on('device:htmlContent', onHTMLContent);
        exports.transport.on('device:fileSource', onFileSource);
        exports.transport.on('device:previewHTML', onPreview);
        exports.transport.on('device:captureScreen', onCaptureScreen);
        exports.transport.on('device:status', onStatus);
        exports.transport.on('device:reload', onReload);
        exports.transport.on('device:plugin', onPlugin);
        exports.transport.on('device:name', onName);
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));


/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * Client browser
 */

(function (exports, global) {

    var client = exports.client = {};

    function showInfo(content, online) {
        var className = "consoleio",
            bgColor = online ? 'rgba(92, 255, 0, 0.5)' : 'rgba(192, 192, 192, 0.5)',
            css = "content: 'Console.IO:" + content + "'; position: fixed; top: 0px; left: 0px; padding: 2px 8px; " +
                "font-size: 12px; font-weight: bold; color: rgb(111, 114, 117); " +
                "background-color: " + bgColor + "; border: 1px solid rgb(111, 114, 117); " +
                "font-family: Monaco,Menlo,Consolas,'Courier New',monospace;";

        exports.util.deleteCSSRule(exports.style, "." + className + "::after");
        exports.util.addCSSRule(exports.style, "." + className + "::after", css);
        document.body.setAttribute("class", className);
    }

    function storeData(data, online) {
        if (!exports.guid) {
            exports.guid = data.guid;

            exports.storage.addItem("guid", data.guid, 365);
        }

        if (!exports.name) {
            exports.name = data.name;
            exports.storage.addItem("deviceName", data.name, 365);
        }

        showInfo([exports.name, exports.guid, online ? 'online' : 'offline'].join('|'), online);
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

    function configWebConsole(data) {
        if (data) {
            exports.web.setConfig(data);

            var info = [exports.name, exports.guid, 'online'];

            if (data.paused) {
                info.push('paused');
            }

            if (data.filters && data.filters.length > 0) {
                info.push('filters:' + data.filters.join(","));
            }

            if (data.pageSize) {
                info.push('pagesize:' + data.pageSize);
            }

            if (data.search) {
                info.push('search:' + data.search);
            }

            showInfo(info.join('|'), true);
        }
    }

    function setUpWebConsole(data) {
        if (data.enabled) {
            exports.web.enabled();
        } else {
            exports.web.disabled();
        }

        if (data.config) {
            configWebConsole(data.config);
        }
    }

    function onDisconnect() {
        showInfo([exports.name, exports.guid, 'offline'].join('|'));
    }

    function onReady(data) {
        storeData(data);
        setUpWebConsole(data.web);

        exports.console.log('Ready', exports.name);
        exports.transport.forceReconnect();
    }

    function onOnline(data) {
        storeData(data, true);
        setUpWebConsole(data.web);

        if (data.guid === exports.guid) {
            exports.transport.subscribed = true;
            exports.transport.clearPendingQueue();

            exports.console.log('Online', exports.name);
        }

        exports.transport.forceReconnect();
    }

    function onOffline(data) {
        storeData(data);

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

        showInfo([exports.name, exports.guid, 'online'].join('|'), true);
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

    function onHTMLContent() {
        var parentNode,
            webLog = document.getElementById(exports.getConfig().consoleId);

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
            webLog = document.getElementById(exports.getConfig().consoleId);

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

        exports.util.requireScript(exports.util.getUrl('html2canvas'), function () {
            var parentNode,
                webLog = document.getElementById(exports.getConfig().consoleId);

            if (webLog) {
                parentNode = webLog.parentNode;
                parentNode.removeChild(webLog);
            }

            global.html2canvas(document.body, {
                completed: false,
                logging: true,
                useCORS: true,
                proxy: exports.util.getUrl('proxy'),
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
        exports.transport.on('disconnect', onDisconnect);
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
        exports.transport.on('device:name', onName);

        exports.transport.on('device:web:control', configWebConsole);
        exports.transport.on('device:web:config', setUpWebConsole);
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));


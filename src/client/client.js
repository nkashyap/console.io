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

    function storeData(data, msg, online) {
        if (!exports.name) {
            exports.name = data.name;
            exports.storage.addItem("deviceName", data.name, 365);
        }

        if (data.serialNumber === exports.serialNumber) {
            exports.transport.showInfoBar(msg, online);
        }
    }

    function addBindSupport() {
        if (Function.prototype.bind) {
            return false;
        }

        Function.prototype.bind = function bind(oThis) {
            if (typeof this !== "function") {
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {
                },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
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

        clone.setAttribute('style', (element.style.display !== 'none') ? exports.util.getAppliedStyles(element) : 'display:none;');

        return clone;
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
        }
    }

    function setUpWebConsole(data) {
        if (data.enabled) {
            exports.web.enabled();
        } else {
            exports.web.disabled();
        }

        configWebConsole(data.config);
    }

    function evalFn(body) {
        /*jshint evil:true */
        var evalFun;
        try {
            //Function first argument is Deprecated
            evalFun = new Function([], "return " + body);
            return evalFun();
        } catch (e) {
            exports.console.error(e, (evalFun && evalFun.toString) ? evalFun.toString() : undefined);
        }
        /*jshint evil:false */
    }

    function extend(source) {
        var clientFns, method;
        if (source) {
            clientFns = evalFn(source);
            if (clientFns) {
                for (method in clientFns) {
                    if (clientFns.hasOwnProperty(method) && !client[method]) {
                        client[method] = clientFns[method];
                    }
                }
            }
        }

        if (client.configure) {
            client.configure(exports, global);
        }
    }

    function onRegistration(data) {
        storeData(data, 'registration');

        // setup client specific scripts
        extend(data.client);

        exports.console.log('Registration', exports.name);
    }

    function onReady(data) {
        storeData(data, 'ready');
        setUpWebConsole(data.web);

        // when client page is refreshed, ready event is not triggered and
        // if connected for the first time registration event is triggered first
        // so setup client specific scripts only once
        if (!client.configure) {
            extend(data.client);
        }

        exports.console.log('Ready', exports.name);
    }

    function onOnline(data) {
        if (data.serialNumber === exports.serialNumber) {
            storeData(data, 'online', true);
            setUpWebConsole(data.web);

            // when client page is refreshed, ready event is not triggered
            // so setup client specific scripts only once
            if (!client.configure) {
                extend(data.client);
            }

            exports.transport.clearPendingQueue();
            exports.console.log('Online', exports.name);
        }
    }

    function onOffline(data) {
        if (data.serialNumber === exports.serialNumber) {
            storeData(data, 'offline');
            exports.console.log('Offline', exports.name);
        }
    }

    function onClientDisconnect(data) {
        if (data.serialNumber === exports.serialNumber) {
            storeData(data, 'client disconnect');
            exports.console.log('client disconnected', exports.serialNumber);
            exports.transport.forceReconnect();
        }
    }

    function onNameChanged(data) {
        if (!data.name) {
            exports.storage.removeItem('deviceName');
        }

        exports.name = data.name;
        exports.storage.addItem('deviceName', exports.name, 365);
        exports.transport.showInfoBar('new name', true);
    }

    function onFileSource(data) {
        try {
            //TODO use proxy for cross-domain files
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

                        exports.transport.emit('source', {
                            url: data.url,
                            content: content
                        });
                    }
                };

                xmlhttp.onloadend = function onloadend(e) {
                    exports.console.info('file:onloadend', e);
                };

                xmlhttp.onloadstart = function onloadstart(e) {
                    exports.console.info('file:onloadstart', e);
                };

                xmlhttp.onprogress = function onprogress(e) {
                    exports.console.info('file:onprogress', e);
                };

                xmlhttp.onload = function onload(e) {
                    exports.console.info('file:onload', e);
                };

                xmlhttp.onerror = function (e) {
                    exports.console.exception('file:onerror', e);
                    exports.transport.emit('source', {
                        url: data.url,
                        content: 'XMLHttpRequest Error: Possibally Access-Control-Allow-Origin security issue.'
                    });
                };

                xmlhttp.send(null);
            } else {
                exports.transport.emit('source', {
                    url: data.url,
                    content: 'XMLHttpRequest request not supported by the browser.'
                });
            }
        } catch (e) {
            exports.console.error(e);
        }
    }

    function onReload() {
        exports.console.log('Reloading...');

        global.setTimeout((function (url) {
            return function () {
                if (global.location.reload) {
                    global.location.reload(true);
                } else {
                    global.location.assign(url);
                }
            };
        }(location.href)), 100);
    }

    function onHTMLContent() {
        exports.web.hide();

        exports.transport.emit('content', {
            content: document.documentElement.innerHTML
        });

        exports.web.show();
    }

    function onPreview() {
        exports.web.hide();

        exports.transport.emit('previewContent', {
            content: '<html><head><style type="text/css">' +
                getStyleRule() + '</style></head>' +
                getStyledElement().outerHTML + '</html>'
        });

        exports.web.show();
    }

    function onCaptureScreen() {

        addBindSupport();

        exports.util.requireScript(exports.util.getUrl('html2canvas'), function () {

            exports.web.hide();

            global.html2canvas(document.body, {
                completed: false,
                logging: true,
                useCORS: true,
                proxy: exports.util.getUrl('proxy'),
                onrendered: function (canvas) {
                    if (!this.completed) {
                        try {
                            this.completed = true;
                            exports.transport.emit('screenShot', {
                                screen: canvas.toDataURL()
                            });

                        } catch (e) {

                            exports.transport.emit('screenShot', {
                                screen: false
                            });

                            exports.console.exception(e);
                        }
                    }

                    exports.web.show();
                }
            });
        });
    }

    function onFileList() {
        var scripts = [],
            styles = [],
            origin = exports.util.getOrigin();

        //scripts
        exports.util.forEach(exports.util.getScripts(), function (script) {
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

        //styles
        exports.util.forEach(exports.util.getStyles(), function (style) {
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
        exports.console.info('executing...');
        var result = evalFn(cmd);
        if (typeof result !== 'undefined') {
            exports.console.command(result);
        }
    }

    client.jsonify = function jsonify(obj) {
        var returnObj = {},
            dataTypes = [
                'Arguments', 'Array', 'String', 'Number', 'Boolean',
                'Error', 'ErrorEvent', 'Object'
            ];

        exports.util.forEachProperty(obj, function (value, property) {
            if (dataTypes.indexOf(exports.util.getType(value)) > -1) {
                returnObj[property] = exports.stringify.parse(value);
            } else {
                returnObj[property] = typeof value;
            }
        });

        return returnObj;
    };

    client.getInfo = function getInfo() {
        var navigator = global.navigator,
            options = {
                userAgent: navigator.userAgent,
                appVersion: navigator.appVersion,
                vendor: navigator.vendor,
                platform: navigator.platform,
                opera: !!global.opera,
                params: exports.getConfig()
            };

        if (exports.serialNumber) {
            options.serialNumber = exports.serialNumber;
        }

        if (exports.name) {
            options.name = exports.name;
        }

        return options;
    };

    client.register = function register() {
        exports.transport.emit('register', client.getInfo());
    };

    client.setUp = function setUp() {
        exports.transport.on('device:registration', onRegistration);
        exports.transport.on('device:ready', onReady);
        exports.transport.on('device:online', onOnline);
        exports.transport.on('device:offline', onOffline);
        exports.transport.on('device:disconnect', onClientDisconnect);
        exports.transport.on('device:command', onCommand);
        exports.transport.on('device:fileList', onFileList);
        exports.transport.on('device:htmlContent', onHTMLContent);
        exports.transport.on('device:fileSource', onFileSource);
        exports.transport.on('device:previewHTML', onPreview);
        exports.transport.on('device:captureScreen', onCaptureScreen);
        exports.transport.on('device:reload', onReload);
        exports.transport.on('device:name', onNameChanged);

        exports.transport.on('device:web:control', configWebConsole);
        exports.transport.on('device:web:config', setUpWebConsole);
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));


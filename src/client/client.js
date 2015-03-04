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

    var client = exports.client = {},
        syncTimeout;

    function storeData (data, msg, online) {
        if (!exports.name) {
            exports.name = data.name;
            exports.storage.addItem("deviceName", data.name, 365);
        }

        if (data.serialNumber === exports.serialNumber) {
            exports.transport.showInfoBar(msg, online);
        }
    }

    function addBindSupport () {
        if (Function.prototype.bind) {
            return false;
        }

        Function.prototype.bind = function bind (oThis) {
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

    function getStyleRule () {
        var styleText = [], links = [],
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
                } else if (style.href) {
                    links.push('<link href="' + style.href + '" rel="stylesheet" >');
                }
            } catch (e) {
            }
        });

        return {
            content: '<style type="text/css">' + styleText.join(" ") + '</style>',
            links: links.join(" ")
        };
    }

    function getStyledElement (element, clone) {
        element = element || document.body;
        clone = clone || element.cloneNode(true);

        exports.util.forEach(exports.util.toArray(element.children), function (child, index) {
            getStyledElement(child, clone.children[index]);
        });

        clone.setAttribute('style', (element.style.display !== 'none') ? exports.util.getAppliedStyles(element) : 'display:none;');

        return clone;
    }

    function getXHR () {
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

    function configWebConsole (data) {
        if (data) {
            exports.web.setConfig(data);
            exports.transport.paused = data.paused;
            if (!data.paused) {
                exports.transport.clearPendingQueue();
            }
        }
    }

    function setUpWebConsole (data) {
        if (typeof data.enabled !== 'undefined') {
            if (data.enabled) {
                exports.web.enabled();
            } else {
                exports.web.disabled();
            }
        }

        configWebConsole(data.config);
    }

    function evalFn (body) {
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

    function extend (source) {
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

    // dispatch data in chunk to avoid core mirror locking up
    function dataPacket (name, data) {
        var content = data.content,
            length = content.length,
            config = exports.getConfig(),
            start = 0;

        if (data.saveFile) {
            dispatchPacket(name, data, content, start, length);
        } else {
            while (start < length) {
                dispatchPacket(name, data, content.substr(start, config.maxDataPacketSize), start, length);

                if (start === 0) {
                    start = config.maxDataPacketSize;
                } else {
                    start += config.maxDataPacketSize;
                }
            }
        }
    }

    function dispatchPacket (name, params, content, start, length) {
        var fn = (function (exports, name, params, content, start, length) {
            return function () {
                var data = exports.util.extend({}, params);
                data.content = content;
                data.start = start;
                data.length = length;
                exports.transport.emit(name, data);
            };
        }(exports, name, params, content, start, length));

        setTimeout(fn, 100);
    }

    function onRegistration (data) {
        storeData(data, 'registration');

        // setup client specific scripts
        extend(data.client);

        exports.console.log('Registration', exports.name);
    }

    function onReady (data) {
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

    function onOnline (data) {
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

    function onOffline (data) {
        if (data.serialNumber === exports.serialNumber) {
            storeData(data, 'offline');
            exports.console.log('Offline', exports.name);
        }
    }

    function onClientDisconnect (data) {
        if (data.serialNumber === exports.serialNumber) {
            storeData(data, 'client disconnect');
            exports.console.log('client disconnected', exports.serialNumber);
            exports.transport.forceReconnect();
        }
    }

    function onNameChanged (data) {
        if (!data.name) {
            exports.storage.removeItem('deviceName');
        }

        exports.name = data.name;
        exports.storage.addItem('deviceName', exports.name, 365);
        exports.transport.showInfoBar('new name', true);
    }

    function onFileSource (data) {
        try {
            var xhr = getXHR(),
                proxy = exports.util.getUrl('proxy'),
                originalURL = data.originalURL || data.url;

            if (xhr) {
                xhr.open("GET", data.url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        var content;
                        if (xhr.status === 200) {
                            content = xhr.responseText;
                        } else {
                            content = xhr.statusText;
                        }

                        dataPacket('source', {
                            url: originalURL,
                            content: content,
                            saveFile: !!data.saveFile
                        });
                    }
                };

                xhr.onloadend = function onLoadEnd (e) {
                    exports.console.info('file:onLoadEnd', e);
                };

                xhr.onloadstart = function onLoadStart (e) {
                    exports.console.info('file:onLoadStart', e);
                };

                xhr.onprogress = function onProgress (e) {
                    exports.console.info('file:onProgress', e);
                };

                xhr.onload = function onLoad (e) {
                    exports.console.info('file:onLoad', e);
                };

                xhr.onerror = function onError (e) {
                    // if xhr fails to get file content use proxy to retrieve it
                    // it might be because of cross domain issue
                    if (data.url.indexOf(proxy) === -1) {
                        data.originalURL = data.url;
                        data.url = proxy + '?url=' + encodeURIComponent(data.url);
                        onFileSource(data);
                    } else {
                        exports.console.exception('file:onError', e);
                        exports.transport.emit('source', {
                            url: originalURL,
                            content: 'XMLHttpRequest Error: Possibally Access-Control-Allow-Origin security issue.'
                        });
                    }
                };

                xhr.send(null);
            } else {
                exports.transport.emit('source', {
                    url: originalURL,
                    content: 'XMLHttpRequest request not supported by the browser.'
                });
            }
        } catch (e) {
            exports.console.error(e);
        }
    }

    function onReload () {
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

    function onHTMLSource () {
        exports.web.hide();
        dataPacket('htmlDocument', {
            content: document.documentElement.innerHTML
        });
        exports.web.show();
    }

    function onHTMLPreview () {
        exports.web.hide();
        var styles = getStyleRule();
        exports.transport.emit('htmlContent', {
            links: styles.links,
            style: styles.content,
            body: getStyledElement().outerHTML
        });

        exports.web.show();
    }

    function onRemoteEvent (data) {
        var raisedEvent,
            element = document.querySelector(data.srcElement.replace("$!", ""));

        if (element) {
            if (syncTimeout) {
                global.clearTimeout(syncTimeout);
            }

            raisedEvent = document.createEvent('HTMLEvents');
            raisedEvent.view = global;
            raisedEvent.initEvent(data.type, true, true);
            exports.util.forEachProperty(data, function (value, property) {
                if (typeof value === 'string') {
                    if (value.indexOf('$!') === 0) {
                        raisedEvent[property] = value === 'body' ? document.body : document.querySelector(value.replace("$!", ""));
                    } else {
                        raisedEvent[property] = value;
                    }
                } else {
                    raisedEvent[property] = value;
                }
            });

            if (element.innerText.indexOf('<') === 0 || data.srcElement === '$!body') {
                element.dispatchEvent(raisedEvent);
            } else {
                element.parentNode.dispatchEvent(raisedEvent);
            }

            syncTimeout = exports.util.async(function () {
                onHTMLPreview();
                global.clearTimeout(syncTimeout);
            }, 500);
        }
    }

    function onCaptureScreen () {

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

    function onFileList () {
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

    function onProfiler (data) {
        if (data.state) {
            exports.console.profile();
        } else {
            exports.console.profileEnd();
        }
    }

    function onCommand (cmd) {
        exports.console.info('executing...');
        var result = evalFn(cmd);
        if (typeof result !== 'undefined') {
            exports.console.command(result);
        }
    }

    function getStorage (storage) {
        var key, i = 0,
            data = {},
            length = storage.length;

        while (i < length) {
            key = storage.key(i++);
            if (key) {
                data[key] = storage.getItem(key);
            }
        }

        return data;
    }

    function isCanvasSupported () {
        var canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    }

    client.reload = onReload;

    client.getMore = function getMore () {
        var data = [
            {
                supports: {
                    WebWorker: !!global.Worker,
                    WebSocket: !!global.WebSocket,
                    Canvas: isCanvasSupported(),
                    Storage: !!global.Storage,
                    LocalStorage: !!global.localStorage,
                    SessionStorage: !!global.sessionStorage,
                    IDBFactory: !!global.IDBFactory,
                    ApplicationCache: !!global.applicationCache,
                    Console: !!exports.console._native,
                    "Object": {
                        create: !!Object.create,
                        keys: !!Object.keys,
                        getPrototypeOf: !!Object.getPrototypeOf,
                        defineProperty: !!Object.defineProperty,
                        defineProperties: !!Object.defineProperties,
                        getOwnPropertyDescriptor: !!Object.getOwnPropertyDescriptor,
                        preventExtensions: !!Object.preventExtensions,
                        isExtensible: !!Object.isExtensible,
                        seal: !!Object.seal,
                        isSealed: !!Object.isSealed,
                        freeze: !!Object.freeze,
                        isFrozen: !!Object.isFrozen
                    },
                    "Array": {
                        isArray: !!Array.isArray,
                        'prototype.indexOf': !!Array.prototype.indexOf,
                        'prototype.lastIndexOf': !!Array.prototype.lastIndexOf,
                        'prototype.reduceRight': !!Array.prototype.reduceRight,
                        'prototype.reduce': !!Array.prototype.reduce,
                        'prototype.map': !!Array.prototype.map,
                        'prototype.forEach': !!Array.prototype.forEach,
                        'prototype.some': !!Array.prototype.some,
                        'prototype.every': !!Array.prototype.every,
                        'prototype.filter': !!Array.prototype.filter
                    },
                    "Function": {
                        'prototype.bind': !!Function.prototype.bind
                    },
                    "Date": {
                        'prototype.toJSON': !!Date.prototype.toJSON
                    },
                    "String": {
                        'prototype.trim': !!String.prototype.trim
                    },
                    "JSON": {
                        'parse': !!global.JSON && !!global.JSON.parse,
                        'stringify': !!global.JSON && !!global.JSON.stringify
                    }
                }
            }
        ];

        if (!!global.localStorage && !!global.sessionStorage) {
            data.push({
                storage: {
                    localStorage: getStorage(global.localStorage),
                    sessionStorage: getStorage(global.sessionStorage)
                }
            });
        }

        return data;
    };

    client.jsonify = function jsonify (obj) {
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

    client.getConfig = function getConfig () {
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

    client.register = function register () {
        exports.transport.emit('register', client.getConfig());
    };

    client.setUp = function setUp () {
        exports.transport.on('device:registration', onRegistration);
        exports.transport.on('device:ready', onReady);
        exports.transport.on('device:online', onOnline);
        exports.transport.on('device:offline', onOffline);
        exports.transport.on('device:disconnect', onClientDisconnect);
        exports.transport.on('device:command', onCommand);
        exports.transport.on('device:fileList', onFileList);
        exports.transport.on('device:htmlSource', onHTMLSource);
        exports.transport.on('device:htmlPreview', onHTMLPreview);
        exports.transport.on('device:remoteEvent', onRemoteEvent);
        exports.transport.on('device:fileSource', onFileSource);
        exports.transport.on('device:captureScreen', onCaptureScreen);
        exports.transport.on('device:reload', onReload);
        exports.transport.on('device:name', onNameChanged);
        exports.transport.on('device:profiler', onProfiler);

        exports.transport.on('device:web:control', configWebConsole);
        exports.transport.on('device:web:config', setUpWebConsole);
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));


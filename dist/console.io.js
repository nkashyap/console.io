/*! console.io - v0.2.0 -    2013-08-28 */

var ConsoleIO = ("undefined" === typeof module ? {} : module.exports);

(function(){

/**
 * util
 *
 * User: nisheeth
 * Date: 19/05/13
 * Time: 14:24
 */

(function (exports, global) {

    var util = exports.util = {},
        domReady = false,
        pendingCallback = [];

    util.queryParams = function queryParams() {
        var i = 0,
            script,
            src,
            params = {},
            scripts = Array.prototype.slice.call(document.scripts || document.getElementsByName('script'));

        // get test info
        for (; !!(script = scripts[i++]);) {
            //TODO script.getAttribute possibility can be removed
            src = (script.src ? script.src : (script.getAttribute('src') || '')).toLowerCase();
            if (src.indexOf('console.io.js') === -1) {
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
    };

    util.checkFile = function checkFile(url) {
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
    };

    util.removeFile = function removeFile(url) {
        var tag = url.indexOf('.js') > -1 ? 'script' : url.indexOf('.css') > -1 ? 'link' : null,
            elements, attr;

        if (tag) {
            attr = tag === 'script' ? 'src' : 'href';
            elements = document.getElementsByTagName(tag);
            util.forEach(util.toArray(elements), function (element) {
                var path = element.getAttribute(attr) || '';
                if (path.indexOf(url) > -1) {
                    element.parentNode.removeChild(element);
                }
            });
        }
    };

    util.requireCSS = function requireCSS(url, callback) {
        if (util.checkFile(url)) {
            if (callback) {
                setTimeout(function () {
                    callback(url);
                }, 10);
            }
            return false;
        }

        var cssNo = document.styleSheets.length,
            link = document.createElement('link'),
            head = document.getElementsByTagName('head')[0];

        if (callback) {
            var interval = global.setInterval(function () {
                if (document.styleSheets.length > cssNo) {
                    callback(url);
                    global.clearInterval(interval);
                }
            }, 10);
        }

        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.media = 'all';
        link.href = url;
        head.appendChild(link);
    };

    util.requireScript = function requireScript(url, callback) {
        if (util.checkFile(url)) {
            setTimeout(function () {
                callback(url);
            }, 10);
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

        } else if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !global.opera) {
            // IE onload handler, this will also cause callback to be called twice
            node.onload = onScriptLoad;
            node.attachEvent('onreadystatechange', onScriptLoad);
        }

        node.src = url;
        head.appendChild(node);
    };

    util.ready = function ready(callback) {
        if (domReady) {
            setTimeout(callback, 1);
            return false;
        } else {
            pendingCallback.push(callback);
        }

        if (pendingCallback.length > 1) {
            return false;
        }

        function callbackFn() {
            domReady = true;

            util.forEach(pendingCallback, function(fn){
                fn();
            });
            pendingCallback = [];
        }

        if (document.readyState === "complete") {
            setTimeout(callbackFn, 1);
        }

        function DOMContentLoaded() {
            if (document.addEventListener) {
                document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                callbackFn();
            } else if (document.attachEvent) {
                if (document.readyState === "complete") {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                    callbackFn();
                }
            }
        }

        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
            global.addEventListener("load", callbackFn, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", DOMContentLoaded);
            global.attachEvent("onload", callbackFn);
        }
    };

    util.require = function require(urls, callback) {
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
            if (url.indexOf('.css') > -1) {
                util.requireCSS(url, onScriptLoaded);
            } else {
                util.requireScript(url, onScriptLoaded);
            }
        }
    };

    util.getUrl = function getUrl(config) {
        return config.url + (config.base ? '/' + config.base : '/');
    };

    util.getConfig = function getConfig() {
        var config = global.ConfigIO || util.queryParams();

        config.socket = config.socket === true || typeof config.socket === 'undefined' || (config.socket || '').toLowerCase() === 'true';
        config.web = config.web === true || (config.web || '').toLowerCase() === 'true';
        config.secure = config.secure === true || (config.secure || '').toLowerCase() === 'true';

        return config;
    };

    util.isIFrameChild = function isIFrameChild() {
        return global.location !== global.parent.location;
    };

    util.foundRequireJS = function foundRequireJS() {
        return typeof global.requirejs !== 'undefined';
    };

    util.foundDefine = function foundDefine() {
        return typeof define === "function" && define.amd;
    };

    util.getObjectType = function getObjectType(data) {
        return Object.prototype.toString.apply(data);
    };

    util.getFunctionName = function getFunctionName(data) {
        var name;
        // in FireFox, Function objects have a name property...
        if (data) {
            name = (data.getName instanceof Function) ? data.getName() : data.name;
            name = name || data.toString().match(/function\s*([_$\w\d]*)/)[1];
        }
        return name || "anonymous";
    };

    util.toArray = function toArray(data) {
        return Array.prototype.slice.call(data);
    };

    util.isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    util.every = (function () {
        if (Array.prototype.every) {
            return function (array, callback, scope) {
                return (array || []).every(callback, scope);
            };
        } else {
            return function (array, callback, scope) {
                array = array || [];
                var i = 0, length = array.length;
                if (length) {
                    do {
                        if (!callback.call(scope || array, array[i], i, array)) {
                            return false;
                        }
                    } while (++i < length);
                }
                return true;
            };
        }
    }());

    util.forEach = (function () {
        if (Array.prototype.forEach) {
            return function (array, callback, scope) {
                (array || []).forEach(callback, scope);
            };
        } else {
            return function (array, callback, scope) {
                array = array || [];
                var i = 0, length = array.length;
                if (length) {
                    do {
                        callback.call(scope || array, array[i], i, array);
                    } while (++i < length);
                }
            };
        }
    }());

    util.forEachProperty = function forEachProperty(obj, callback, scope) {
        var prop;
        for (prop in obj) {
            callback.call(scope || obj, obj[prop], prop, obj);
        }
    };

    util.extend = function extend(target, source) {
        util.forEachProperty(source, function (value, property) {
            target[property] = value;
        });

        return target;
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));

/**
 * Storage
 *
 * User: nisheeth
 * Date: 26/08/13
 * Time: 09:39
 */

(function (exports, global) {

    var storage = exports.storage = {},
        memoryStore = {};

    exports.util.ready(function () {
        var i, cookie, key, value,
            cookies = document.cookie.split('; '),
            length = cookies.length;

        for (i = 0; i < length; i++) {
            cookie = cookies[i].split('=');
            key = cookie[0];
            value = cookie[1];
            memoryStore[key] = value;

            if (global.localStorage) {
                if (!global.localStorage.getItem(key)) {
                    global.localStorage.setItem(key, value);
                }
            }
        }

        // override cookie with localstorage value
        if (global.localStorage) {
            var guid = global.localStorage.getItem('guid'),
                deviceName = global.localStorage.getItem('deviceName');

            if (guid && !memoryStore.guid) {
                storage.addItem('guid', guid, 365, true);
            }

            if (deviceName && !memoryStore.deviceName) {
                storage.addItem('deviceName', deviceName, 365, true);
            }
        }
    });

    storage.addItem = function addItem(name, value, days, skipLocalStorage) {
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
        memoryStore[name] = value;

        if (!skipLocalStorage && global.localStorage) {
            global.localStorage.setItem(name, value);
        }
    };

    storage.removeItem = function removeItem(name) {
        storage.addItem(name, '', -1, true);
        delete memoryStore[name];

        if (global.localStorage) {
            global.localStorage.removeItem(name);
        }
    };

    storage.getItem = function getItem(name) {
        if (global.localStorage) {
            return global.localStorage.getItem(name) || memoryStore[name];
        }
        return memoryStore[name];
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));

/**
 * EventEmitter
 *
 * User: nisheeth
 * Date: 27/08/13
 * Time: 10:13
 */

(function (exports, global) {

    /**
     * Expose constructor.
     */
    exports.EventEmitter = EventEmitter;

    /**
     * Event emitter constructor.
     *
     * @api public.
     */
    function EventEmitter() {
    }

    /**
     * Adds a listener
     *
     * @api public
     */
    EventEmitter.prototype.on = function (name, fn) {
        if (!this.$events) {
            this.$events = {};
        }

        if (!this.$events[name]) {
            this.$events[name] = fn;
        } else if (exports.util.isArray(this.$events[name])) {
            this.$events[name].push(fn);
        } else {
            this.$events[name] = [this.$events[name], fn];
        }

        return this;
    };

    EventEmitter.prototype.addListener = EventEmitter.prototype.on;

    /**
     * Adds a volatile listener.
     *
     * @api public
     */
    EventEmitter.prototype.once = function (name, fn) {
        var self = this;

        function on() {
            self.removeListener(name, on);
            fn.apply(this, arguments);
        }

        on.listener = fn;
        this.on(name, on);

        return this;
    };

    /**
     * Removes a listener.
     *
     * @api public
     */
    EventEmitter.prototype.removeListener = function (name, fn) {
        if (this.$events && this.$events[name]) {
            var list = this.$events[name];

            if (exports.util.isArray(list)) {
                var pos = -1;

                for (var i = 0, l = list.length; i < l; i++) {
                    if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
                        pos = i;
                        break;
                    }
                }

                if (pos < 0) {
                    return this;
                }

                list.splice(pos, 1);

                if (!list.length) {
                    delete this.$events[name];
                }
            } else if (list === fn || (list.listener && list.listener === fn)) {
                delete this.$events[name];
            }
        }

        return this;
    };

    /**
     * Removes all listeners for an event.
     *
     * @api public
     */
    EventEmitter.prototype.removeAllListeners = function (name) {
        if (name === undefined) {
            this.$events = {};
            return this;
        }

        if (this.$events && this.$events[name]) {
            this.$events[name] = null;
        }

        return this;
    };

    /**
     * Gets all listeners for a certain event.
     *
     * @api publci
     */
    EventEmitter.prototype.listeners = function (name) {
        if (!this.$events) {
            this.$events = {};
        }

        if (!this.$events[name]) {
            this.$events[name] = [];
        }

        if (!exports.util.isArray(this.$events[name])) {
            this.$events[name] = [this.$events[name]];
        }

        return this.$events[name];
    };

    /**
     * Emits an event.
     *
     * @api public
     */
    EventEmitter.prototype.emit = function (name) {
        if (!this.$events) {
            return false;
        }

        var handler = this.$events[name];

        if (!handler) {
            return false;
        }

        var args = Array.prototype.slice.call(arguments, 1);

        if ('function' == typeof handler) {
            handler.apply(this, args);
        } else if (exports.util.isArray(handler)) {
            var listeners = handler.slice();

            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].apply(this, args);
            }
        } else {
            return false;
        }

        return true;
    };
}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));

/**
 * Stringify
 *
 * User: nisheeth
 * Date: 27/08/13
 * Time: 11:00
 */

(function (exports, global) {

    var stringify = exports.stringify = {};

    stringify.objects = [
        '[object Arguments]', '[object Array]',
        '[object String]', '[object Number]', '[object Boolean]',
        '[object Function]', '[object Object]', '[object Geoposition]', '[object Coordinates]',
        '[object CRuntimeObject]'
    ];

    stringify.events = [
        '[object Event]', '[object KeyboardEvent]', '[object MouseEvent]', '[object TouchEvent]',
        '[object WheelEvent]', '[object UIEvent]', '[object CustomEvent]', '[object NotifyAudioAvailableEvent]',
        '[object CompositionEvent]', '[object CloseEvent]', '[object MessageEvent]', '[object MessageEvent]'
    ];

    stringify.errors = [
        '[object Error]', '[object ErrorEvent]', '[object DOMException]',
        '[object PositionError]'
    ];

    stringify.parse = function parse(data, level, simple) {
        var value = '',
            type = exports.util.getObjectType(data);

        simple = typeof simple === 'undefined' ? true : simple;
        level = level || 1;

        if (stringify.objects.indexOf(type) > -1 || stringify.events.indexOf(type) > -1 || stringify.errors.indexOf(type) > -1) {
            switch (type) {
                case '[object Error]':
                case '[object ErrorEvent]':
                    data = data.message;
                case '[object String]':
                    value = stringify.parseString(data);
                    break;

                case '[object Arguments]':
                    data = exports.util.toArray(data);
                case '[object Array]':
                    value = stringify.parseArray(data, level);
                    break;

                case '[object Number]':
                    value = String(data);
                    break;

                case '[object Boolean]':
                    value = data ? 'true' : 'false';
                    break;

                case '[object Function]':
                    value = '"' + exports.util.getFunctionName(data) + '"';
                    break;

                default:
                    value = stringify.parseObject(type, data, level);
                    break;
            }
        } else if (data === null) {
            value = '"null"';

        } else if (data === undefined) {
            value = '"undefined"';

        } else if (simple) {
            value = stringify.parseObject(type, data, level);

        } else {
            try {
                value = String(data);
            } catch (e) {
                exports.console.error(e);
            }
        }

        return value;
    };

    stringify.valueOf = function valueOf(data, skipGlobal, level) {
        var type = exports.util.getObjectType(data);

        if ((stringify.objects.indexOf(type) > -1 || stringify.events.indexOf(type) > -1 || stringify.errors.indexOf(type) > -1) && !skipGlobal) {
            return this.parse(data, level);
        } else {
            if (type === '[object Function]') {
                type = '[Function ' + exports.util.getFunctionName(data) + ']';
            } else if (data && data.constructor && data.constructor.name) {
                type = '[object ' + data.constructor.name + ']';
            }

            return type;
        }
    };

    stringify.parseString = function parseString(data) {
        return '"' + data.replace(/"/g, '\'').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '"';
    };

    stringify.parseArray = function parseArray(data, level) {
        var target = [];
        exports.util.forEach(data, function (item, index) {
            this[index] = stringify.valueOf(item, false, level);
        }, target);

        if (target.length > 0) {
            return '[ ' + target.join(', ') + ' ]';
        } else {
            return '[ ' + data.toString() + ' ]';
        }
    };

    stringify.parseObject = function parseObject(type, data, level) {
        var name = '',
            skipGlobal = type === '[object global]',
            tabAfter = (new Array(level)).join('\t'),
            tabBefore = (new Array(++level)).join('\t'),
            target = [];

        if (data && data.constructor) {
            name = data.constructor.name;
        }

        exports.util.forEachProperty(data, function (value, property) {
            this.push(tabBefore + '"' + property + '": ' + stringify.valueOf(value, skipGlobal, level));
        }, target);

        if (target.length > 0) {
            return (name || type) + ': {\n' + target.join(',\n') + '\n' + tabAfter + '}';
        } else {
            return data.toString() + '\n';
        }
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));

/**
 * Formatter
 *
 * User: nisheeth
 * Date: 27/08/13
 * Time: 10:30
 */

(function (exports, global) {

    var formatter = exports.formatter = {};

    /**
     * Given arguments array as a String, subsituting type names for non-string types.
     *
     * @param {Arguments} args
     * @return {Array} of Strings with stringified arguments
     */
    function stringifyArguments(args) {
        var result = [],
            slice = Array.prototype.slice;

        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            if (arg === undefined) {
                result[i] = 'undefined';
            } else if (arg === null) {
                result[i] = 'null';
            } else if (arg.constructor) {
                if (arg.constructor === Array) {
                    if (arg.length < 3) {
                        result[i] = '[' + stringifyArguments(arg) + ']';
                    } else {
                        result[i] = '[' + stringifyArguments(slice.call(arg, 0, 1)) + '...' + stringifyArguments(slice.call(arg, -1)) + ']';
                    }
                } else if (arg.constructor === Object) {
                    result[i] = '#object';
                } else if (arg.constructor === Function) {
                    result[i] = '#function';
                } else if (arg.constructor === String) {
                    result[i] = '"' + arg + '"';
                } else if (arg.constructor === Number) {
                    result[i] = arg;
                }
            }
        }

        return result.join(",");
    }

    // From https://github.com/eriwen/javascript-stacktrace
    /**
     * Given an Error object, return a formatted Array based on Chrome's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    formatter.chrome = function chrome(e) {
        var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
            replace(/^\s+(at eval )?at\s+/gm, '').
            replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
            replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
        stack.pop();
        return stack;
    };

    /**
     * Given an Error object, return a formatted Array based on Safari's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    formatter.safari = function safari(e) {
        return e.stack.replace(/\[native code\]\n/m, '')
            .replace(/^(?=\w+Error\:).*$\n/m, '')
            .replace(/^@/gm, '{anonymous}()@')
            .split('\n');
    };

    /**
     * Given an Error object, return a formatted Array based on IE's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    formatter.ie = function ie(e) {
        var lineRE = /^.*at (\w+) \(([^\)]+)\)$/gm;
        return e.stack.replace(/at Anonymous function /gm, '{anonymous}()@')
            .replace(/^(?=\w+Error\:).*$\n/m, '')
            .replace(lineRE, '$1@$2')
            .split('\n');
    };

    /**
     * Given an Error object, return a formatted Array based on Firefox's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    formatter.firefox = function firefox(e) {
        return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^[\(@]/gm, '{anonymous}()@').split('\n');
    };

    formatter.opera11 = function opera11(e) {
        var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var location = match[4] + ':' + match[1] + ':' + match[2];
                var fnName = match[3] || "global code";
                fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    };

    formatter.opera10b = function opera10b(e) {
        // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
        // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
        // "@file://localhost/G:/js/test/functional/testcase1.html:15"
        var lineRE = /^(.*)@(.+):(\d+)$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i++) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[1] ? (match[1] + '()') : "global code";
                result.push(fnName + '@' + match[2] + ':' + match[3]);
            }
        }

        return result;
    };

    /**
     * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    formatter.opera10a = function opera10a(e) {
        // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[3] || ANON;
                result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    };

    // Opera 7.x-9.2x only!
    formatter.opera9 = function opera9(e) {
        // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        var lines = e.message.split('\n'), result = [];

        for (var i = 2, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    };

    // Safari 5-, IE 9-, and others
    formatter.other = function other(curr) {
        var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
        while (curr && curr['arguments'] && stack.length < maxStackSize) {
            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
            args = Array.prototype.slice.call(curr['arguments'] || []);
            stack[stack.length] = fn + '(' + stringifyArguments(args) + ')';
            curr = curr.caller;
        }
        return stack;
    };


}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));

/**
 * StackTrace
 *
 * User: nisheeth
 * Date: 27/08/13
 * Time: 10:30
 */

(function (exports, global) {

    var stacktrace = exports.stacktrace = {};

    function create() {
        try {
            undefined();
        } catch (e) {
            return e;
        }
    }

    function getFormatter(e) {
        if (e['arguments'] && e.stack) {
            return exports.formatter['chrome'];

        } else if (e.stack && e.sourceURL) {
            return exports.formatter['safari'];

        } else if (e.stack && e.number) {
            return exports.formatter['ie'];

        } else if (typeof e.message === 'string' && typeof window !== 'undefined' && window.opera) {
            if (!e.stacktrace) {
                return exports.formatter['opera9'];
            }

            if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                return exports.formatter['opera9'];
            }

            if (!e.stack) {
                return exports.formatter['opera10a'];
            }

            if (e.stacktrace.indexOf("called from line") < 0) {
                return exports.formatter['opera10b'];
            }

            return exports.formatter['opera11'];

        } else if (e.stack) {
            return exports.formatter['firefox'];
        }

        return 'other';
    }

    stacktrace.allowedErrorStackLookUp = [
        '[object Error]', '[object ErrorEvent]', '[object DOMException]',
        '[object PositionError]'
    ];

    stacktrace.get = function get(e) {
        e = e || create();

        var formatterFn = getFormatter(e);
        if (typeof formatterFn === 'function') {
            return formatterFn(e);
        } else {
            var errorClass = exports.util.getObjectType(e);
            if (stacktrace.allowedErrorStackLookUp.indexOf(errorClass) === -1) {
                return errorClass + ' is missing from "stacktrace.allowedErrorStackLookUp[' + stacktrace.allowedErrorStackLookUp.join(',') + ']";';
            }

            return exports.formatter.other(arguments.callee);
        }
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));

/**
 * transport
 *
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:13
 */
(function (exports, global) {

    var transport = exports.transport = {},
        interval = null,
        pending = [];


    function onMessage(event) {
        var data = event.data;
        transport.emit(data.event, {
            type: data.type,
            message: data.message,
            stack: data.stack
        });
    }

    function onConnect() {
        var navigator = global.navigator;

        exports.console.log('Connected to the Server');

        transport.emit('setUp', {
            guid: exports.guid,
            deviceName: exports.name,
            userAgent: navigator.userAgent,
            appVersion: navigator.appVersion,
            vendor: navigator.vendor,
            platform: navigator.platform,
            opera: !!global.opera,
            params: exports.config
        });

        transport.forceReconnect();
    }

    function onConnecting(mode) {
        transport.connectionMode = mode;
        exports.console.log('Connecting to the Server');
    }

    function onReconnect(mode, attempts) {
        transport.connectionMode = mode;
        transport.subscribed = true;

        transport.clearPendingQueue();

        exports.console.log('Reconnected to the Server after ' + attempts + ' attempts.');

        transport.forceReconnect();
    }

    function onReconnecting() {
        exports.console.log('Reconnecting to the Server');
    }

    function onDisconnect() {
        exports.console.log('Disconnected from the Server');
    }

    function onConnectFailed() {
        exports.console.warn('Failed to connect to the Server');
    }

    function onReconnectFailed() {
        exports.console.warn('Failed to reconnect to the Server');
    }

    function onError() {
        exports.console.warn('Socket Error');
    }


    transport.connectionMode = '';
    transport.subscribed = false;

    transport.setUp = function setUp() {
        exports.guid = exports.storage.getItem('guid');
        exports.name = exports.storage.getItem('deviceName');

        /** Fix for old Opera and Maple browsers
         * to process JSONP requests in a queue
         */
        (function overrideJsonPolling(io) {
            var original = io.Transport["jsonp-polling"].prototype.post;

            io.Transport["jsonp-polling"].prototype.requestQueue = [];
            io.Transport["jsonp-polling"].prototype.isProcessingQueue = false;
            io.Transport["jsonp-polling"].prototype.hasOutstandingRequests = false;
            io.Transport["jsonp-polling"].prototype.postRequest = function postRequest() {
                var scope = this;
                this.isProcessingQueue = true;
                setTimeout(function () {
                    original.call(scope, scope.requestQueue.shift());
                }, 10);
            };
            io.Transport["jsonp-polling"].prototype.completePostRequest = function completePostRequest() {
                var scope = this;
                setTimeout(function () {
                    scope.socket.setBuffer(false);
                    scope.hasOutstandingRequests = scope.requestQueue.length > 0;
                    scope.isProcessingQueue = false;
                    scope.processPendingRequests();
                }, 250);
            };
            io.Transport["jsonp-polling"].prototype.processPendingRequests = function processPendingRequests() {
                if (this.hasOutstandingRequests && !this.isProcessingQueue) {
                    this.postRequest();
                    this.completePostRequest();
                }
            };
            io.Transport["jsonp-polling"].prototype.post = function (data) {
                this.requestQueue.push(data);
                this.hasOutstandingRequests = true;
                this.processPendingRequests();
            };

        }(global.io));

        transport.io = exports.io.connect(exports.config.url, {
            secure: exports.config.secure,
            resource: (exports.config.base || '') + 'socket.io'
        });

        // set console.io event
        exports.console.on('console', function (data) {
            transport.emit('console', {
                type: data.type,
                message: escape(data.message),
                stack: data.stack
            });
        });

        if (global.addEventListener) {
            global.addEventListener("message", onMessage, false);
        } else if (global.attachEvent) {
            global.attachEvent('onmessage', onMessage);
        }

        // set events
        transport.io.on('connect', onConnect);
        transport.io.on('connecting', onConnecting);
        transport.io.on('reconnect', onReconnect);
        transport.io.on('reconnecting', onReconnecting);
        transport.io.on('disconnect', onDisconnect);
        transport.io.on('connect_failed', onConnectFailed);
        transport.io.on('reconnect_failed', onReconnectFailed);
        transport.io.on('error', onError);
    };

    transport.emit = function emit(name, data) {
        if (transport.isConnected()) {
            transport.io.emit('device:' + name, data);
            return true;
        } else {
            pending.push({ name: name, data: data });
            return false;
        }
    };

    transport.on = function on(name, callback, scope) {
        if (transport.io) {
            transport.io.on(name, function () {
                callback.apply(scope || this, arguments);
            });
        }
    };

    transport.isConnected = function isConnected() {
        return transport.io && transport.io.socket ? transport.io.socket.connected : false;
    };

    transport.forceReconnect = function forceReconnect() {
        if (!exports.config.forceReconnection || interval) {
            return false;
        }

        interval = global.setInterval(function () {
            var connected = transport.isConnected();

            if (!connected || (connected && !transport.subscribed)) {

                exports.console.log('forceReconnect reconnecting', exports.name);

                transport.io.socket.disconnectSync();
                transport.io.socket.reconnect();

                global.clearInterval(interval);
                interval = null;
            }

        }, exports.config.forceReconnectInterval);
    };

    transport.clearPendingQueue = function clearPendingQueue() {
        var queue = [];

        exports.util.forEach(pending, function (item) {
            var state = transport.emit(item.name, item.data);
            if (!state) {
                queue.push(item);
            }
        });

        pending = queue;
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));

/**
 * Console wrapper
 *
 * User: nisheeth
 * Date: 27/08/13
 * Time: 11:16
 */

(function (exports, global) {

    var console = exports.console = new exports.EventEmitter(),
        nativeConsole = global.console,
        withoutScope = ['dir', 'dirxml'],
        counters = {},
        timeCounters = {};


    function send(type, args, value, callStack) {
        if (nativeConsole && exports.config.nativeConsole) {
            if (nativeConsole[type]) {
                if (withoutScope.indexOf(type) > -1) {
                    nativeConsole[type](args);
                } else {
                    nativeConsole[type].apply(nativeConsole, args);
                }
            }
        }

        if (args && args.hasOwnProperty("length")) {
            if (args.length > 0) {
                args = exports.util.toArray(args);
            }
        }

        console.emit('console', {
            type: type,
            message: value || exports.stringify.parse(args),
            stack: callStack ? exports.stringify.parse(callStack) : ''
        });
    }

    console.profiles = [];

    console.assert = function assert(x) {
        if (!x) {
            var args = ['Assertion failed:'];
            args = args.concat(exports.util.toArray(arguments).slice(1));
            send("assert", arguments, exports.stringify.parse(args), exports.stacktrace.get());
        } else {
            send("assert", arguments);
        }
    };

    console.count = function count(key) {
        var frameId = (key || '_GLOBAL_'),
            frameCounter = counters[frameId];

        if (!frameCounter) {
            counters[frameId] = frameCounter = {
                key: key || '',
                count: 1
            };
        } else {
            ++frameCounter.count;
        }

        send("count", arguments, (key || '') + ": " + frameCounter.count);
    };

    console.time = function time(name, reset) {
        if (!name) {
            return false;
        }

        var key = "KEY" + name.toString();

        if (!reset && timeCounters[key]) {
            return false;
        }

        timeCounters[key] = (new Date()).getTime();

        send("time", arguments);
    };

    console.timeEnd = function timeEnd(name) {
        if (!name) {
            return false;
        }

        var key = "KEY" + name.toString(),
            timeCounter = timeCounters[key];

        if (timeCounter) {
            delete timeCounters[key];

            send("timeEnd", arguments, name + ": " + ((new Date()).getTime() - timeCounter) + "ms");
        }
    };

    console.debug = function debug() {
        send("debug", arguments);
    };

    console.warn = function warn() {
        send("warn", arguments);
    };

    console.info = function info() {
        send("info", arguments);
    };

    console.log = function log() {
        send("log", arguments);
    };

    console.dir = function dir(obj) {
        send("dir", obj);
    };

    console.dirxml = function dirxml(node) {
        var value,
            nodeType = node.nodeType;

        if (nodeType === 9) {
            node = node.documentElement;
        }

        value = node ? node.outerHTML || node.innerHTML || node.toString() || exports.stringify.parse(node) : null;

        if (value) {
            value = value.replace(/</img, '&lt;');
            value = value.replace(/>/img, '&gt;');
        }

        send("dirxml", node, value);
    };

    console.group = function group() {
        send("group", arguments);
    };

    console.groupCollapsed = function groupCollapsed() {
        send("groupCollapsed", arguments);
    };

    console.groupEnd = function groupEnd() {
        send("groupEnd");
    };

    console.markTimeline = function markTimeline() {
        send("markTimeline", arguments);
    };

    console.timeStamp = function timeStamp(name) {
        send("timeStamp", arguments);
    };

    console.profile = function profile(title) {
        send("profile", arguments);
    };

    console.profileEnd = function profileEnd(title) {
        send("profileEnd", arguments);
    };

    console.error = function error(e) {
        send("error", arguments, null, exports.stacktrace.get(e));
    };

    console.exception = function exception(e) {
        send("error", arguments);
    };

    console.trace = function trace() {
        send("trace", arguments, null, exports.stacktrace.get());
    };

    console.clear = function clear() {
        counters = {};
        timeCounters = {};
        send("clear", arguments);
    };

    console.command = function command() {
        send("command", arguments);
    };

    global.console = console;

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));

/**
 * Client browser
 *
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
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
        if (data.WebIO) {
            if (data.WebIO.enabled) {
                exports.util.requireCSS(exports.util.getUrl(exports.config) + "resources/console.css");

                var config = exports.util.extend({}, exports.config);
                exports.web.setUp(exports.util.extend(config, data.WebIO));
            } else if (!data.WebIO.enabled) {
                exports.web.disabled();
            }
        }
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



/**
 * Console.IO main init file
 *
 * User: nisheeth
 * Date: 26/08/13
 * Time: 09:51
 */

(function (exports, global) {

    exports.version = '0.0.15';
    exports.guid = '';
    exports.name = '';
    exports.config = {
        url: '',
        base: '/',
        html2canvas: "addons/html2canvas.js",
        socketio: "socket.io/socket.io.js",
        forceReconnection: true,
        forceReconnectInterval: 5000,
        nativeConsole: true,
        webOnly: false,

        docked: false,
        position: 'bottom',
        height: '300px',
        width: '99%'
    };

    exports.debug = function debug(msg) {
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
    };

    // Cover uncaught exceptions
    // Returning true will surpress the default browser handler,
    // returning false will let it run.
    var onErrorHandler = global.onerror;
    global.onerror = function onErrorFn(error, filePath, lineNo) {
        var result = false;
        if (onErrorHandler) {
            result = onErrorHandler(error, filePath, lineNo);
        }

        // Treat return value as window.onerror itself does,
        // Only do our handling if not suppressed.
        if (exports.transport.isConnected()) {
            exports.transport.emit('console', {
                type: 'error',
                message: error + ';\nfileName: ' + filePath + ';\nlineNo: ' + lineNo
            });
        } else if (exports.util.isIFrameChild()) {
            exports.console.exception(error + ';\nfileName: ' + filePath + ';\nlineNo: ' + lineNo);
        } else {
            exports.debug([error, filePath, lineNo].join("; "));
        }

        return result;
    };

    // Setup RequireJS global error handler
    if (exports.util.foundRequireJS()) {
        global.requirejs.onError = function (error) {
            exports.console.error(error, error.requireModules, error.originalError);
        };
    }


    /**
     * Maple browser fix
     * Maple has interface for both addEventListener and attachEvent
     * but attachEvent is not fully implemented so it never raise any event
     *
     * set it to undefined to force other libraries to use addEventListener instead
     */
    if (global.navigator.userAgent.search(/Maple/i) > -1) {
        /**
         * override samsung maple logging
         */
        global.alert = global.console.info;

        if (typeof HTMLElement.prototype.addEventListener === 'function' &&
            typeof HTMLElement.prototype.attachEvent === 'function') {
            HTMLElement.prototype.attachEvent = undefined;
        }
    }

    /** IE console fix */
    if (Function.prototype.bind && global.console && typeof global.console.log === "object") {
        exports.util.forEach(["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"],
            function (method) {
                global.console[method] = this.bind(global.console[method], global.console);
            },
            Function.prototype.call);
    }


    if (exports.util.isIFrameChild() && global.parent.postMessage) {
        exports.console.on('console', function (data) {
            global.parent.postMessage({
                event: 'console',
                type: data.type,
                message: escape(data.message),
                stack: data.stack
            }, "*");
        });
    }


    function configure(io, config) {
        exports.io = io || global.io;
        if(config){
            exports.util.extend(exports.config, config);
        }
        exports.transport.setUp();
        exports.client.setUp();
    }


    exports.util.ready(function () {
        exports.util.extend(exports.config, exports.util.getConfig());

        if (!exports.config.webOnly) {
            //Request console.io.js file to get connect.sid cookie from the server
            //Socket.io use connection cookie
            if (!exports.util.isIFrameChild()) {
                if (exports.util.foundRequireJS()) {
                    global.require(["socket.io","console.io.config"], configure);
                } else {
                    exports.util.require(exports.util.getUrl(exports.config) + exports.config.socketio, configure);
                }
            }
        }
    });

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));

/**
 * Web
 *
 * User: nisheeth
 * Date: 27/08/13
 * Time: 14:57
 */

(function (exports, global) {

    var web = exports.web = {};

    function Controller(config) {
        this.store = {
            added: [],
            queue: []
        };

        this.config = exports.util.extend({
            docked: false,
            position: 'bottom',
            height: '300px',
            width: '99%'
        }, config);

        this.control = {
            pageSize: 50,
            filters: [],
            paused: false,
            search: null
        };

        this.view = new View(this);

        exports.transport.on('device:pluginConfig', this.syncConfig, this);
        exports.transport.on('device:pluginControl', this.syncControl, this);
        exports.transport.emit('plugin', { name: 'WebIO', enabled: true });
    }

    Controller.prototype.render = function render(target) {
        this.view.render(target);
    };

    Controller.prototype.destroy = function destroy() {
        exports.transport.emit('plugin', { name: 'WebIO', enabled: false });
        this.view.destroy();
    };

    Controller.prototype.syncControl = function syncControl(data) {
        if (data.clear) {
            this.view.clear();
        } else {
            if (typeof data.paused !== 'undefined') {
                this.control.paused = data.paused;
            }

            if (typeof data.filters !== 'undefined') {
                this.control.filters = data.filters;
            }

            if (data.pageSize !== this.control.pageSize) {
                this.control.pageSize = data.pageSize;
            }

            if (data.search !== this.control.search) {
                this.applySearch(data.search);
            }

            this.view.clear();
            this.view.addBatch(this.getData(this.store.added));
            this.addBatch();
        }
    };

    Controller.prototype.syncConfig = function syncConfig(data) {
        this.config = exports.util.extend(this.config, data);
        this.view.reload();
    };

    Controller.prototype.getData = function getData(store) {
        var count = 0, dataStore = [];
        if (store.length > 0) {
            exports.util.every([].concat(store).reverse(), function (item) {
                if (this.isFiltered(item) && this.isSearchFiltered(item)) {
                    dataStore.push(item);
                    count++;
                }

                return this.control.pageSize > count;
            }, this);
        }

        return dataStore;
    };

    Controller.prototype.add = function add(data) {
        if (!this.control.paused) {
            this.store.added.push(data);
            this.view.add(data);
        } else {
            this.store.queue.push(data);
        }
    };

    Controller.prototype.addBatch = function addBatch() {
        if (!this.control.paused) {
            this.view.addBatch(this.getData(this.store.queue));
            this.store.added = this.store.added.concat(this.store.queue);
            this.store.queue = [];
        }
    };

    Controller.prototype.applySearch = function applySearch(value) {
        this.control.search = typeof value !== 'undefined' ? value : null;
        if (this.control.search) {
            if (this.control.search[0] !== "\\") {
                this.control.search = new RegExp("\\b" + this.control.search, "img");
            } else {
                this.control.search = new RegExp(this.control.search, "img");
            }
        }
    };

    Controller.prototype.isSearchFiltered = function isSearchFiltered(data) {
        return this.control.search ? data.message.search(this.control.search) > -1 : true;
    };

    Controller.prototype.isFiltered = function isFiltered(data) {
        return this.control.filters.length === 0 || (this.control.filters.length > 0 && this.control.filters.indexOf(data.type) > -1);
    };


    function View(ctrl) {
        this.ctrl = ctrl;
        this.elements = {};
        this.target = null;
        this.container = null;
    }

    View.prototype.render = function render(target) {
        this.target = target;
        this.createContainer();
    };

    View.prototype.reload = function reload() {
        this.clear();
        this.container.parentNode.removeChild(this.container);
        this.createContainer();
    };

    View.prototype.destroy = function destroy() {
        this.clear();
        this.container.parentNode.removeChild(this.container);
    };

    View.prototype.createContainer = function createContainer() {
        var styles = [
            'background-color: rgba(219, 255, 232, 0.3)',
            'overflow: auto',
            'margin: 5px',
            '-o-box-shadow: 0 0 5px 1px #888',
            '-moz-box-shadow: 0 0 5px 1px #888',
            '-webkit-box-shadow: 0 0 5px 1px #888',
            'box-shadow: 0 0 5px 1px #888'
        ];

        if (!this.ctrl.config.docked) {
            styles.push('position:absolute');
        }

        if (this.ctrl.config.height) {
            styles.push('height:' + this.ctrl.config.height);
        }

        if (this.ctrl.config.width) {
            styles.push('width:' + this.ctrl.config.width);
        }

        switch (this.ctrl.config.position.toLowerCase()) {
            case 'top':
                styles.push('top: 5px');
                break;
            default:
                styles.push('bottom: 5px');
                break;
        }

        this.container = this.createElement({
            attr: {
                id: 'console-log',
                'style': styles.join(';'),
                tabindex: 1
            },
            target: this.target,
            position: this.ctrl.config.position
        });
    };

    View.prototype.createElement = function createElement(config) {
        config.tag = config.tag || 'div';
        if (!this.elements[config.tag]) {
            this.elements[config.tag] = document.createElement(config.tag);
        }

        var element = this.elements[config.tag].cloneNode(false);
        exports.util.forEachProperty(config.attr, function (value, property) {
            if (value) {
                element.setAttribute(property, value);
            }
        });

        exports.util.forEachProperty(config.prop, function (value, property) {
            if (value) {
                element[property] = value;
            }
        });

        if (config.target) {
            if (config.position && config.position === 'top') {
                config.target.insertBefore(element, config.target.firstElementChild || config.target.firstChild);
            } else {
                config.target.appendChild(element);
            }
        }

        return element;
    };

    View.prototype.stripBrackets = function stripBrackets(data) {
        var last = data.length - 1;
        if (data.charAt(0) === '[' && data.charAt(last) === ']') {
            return data.substring(1, last);
        }
        return data;
    };

    View.prototype.getElementData = function getElementData(data) {
        var tag = 'code',
            css = data.type,
            stackMessage,
            message = this.stripBrackets(data.message);

        // check if asset failed
        if (data.type === "assert") {
            var asset = this.stripBrackets(message).split(",");
            if (asset[0].toLowerCase() !== "true") {
                css = "assert-failed";
            }
        }

        // for Opera and Maple browser
        message = message.replace(/%20/img, " ");

        // switch to pre mode if message contain object
        if (message.indexOf("{") > -1 && message.indexOf("}") > -1) {
            tag = 'pre';
        }

        if (data.stack) {
            var stack = data.stack.split(",")
                .join("\n")
                .replace(/"/img, '')
                .replace(/%20/img, ' ');

            stackMessage = this.stripBrackets(stack);
            message += '\n' + stackMessage;
        }

        if (['assert', 'dir', 'dirxml', 'error', 'trace'].indexOf(data.type) > -1) {
            tag = 'pre';
        }

        return {
            tag: tag,
            className: 'console type-' + css,
            message: (message || '.')
        };
    };

    View.prototype.add = function add(data) {
        if (!this.ctrl.isFiltered(data) || !this.ctrl.isSearchFiltered(data)) {
            return false;
        }

        var element = this.getElementData(data);

        this.createElement({
            tag: element.tag,
            attr: {
                'class': element.className
            },
            prop: {
                innerHTML: element.message
            },
            target: this.container,
            position: 'top'
        });

        this.removeOverflowElement();
    };

    View.prototype.addBatch = function addBatch(store) {
        if (store.length > 0) {
            var fragment = document.createDocumentFragment();

            exports.util.forEach(store, function (item) {
                var element = this.getElementData(item);
                this.createElement({
                    tag: element.tag,
                    attr: {
                        'class': element.className
                    },
                    prop: {
                        innerHTML: element.message
                    },
                    target: fragment,
                    position: 'bottom'
                });
            }, this);

            this.container.insertBefore(fragment, this.container.firstElementChild || this.container.firstChild);
            this.removeOverflowElement();
        }
    };

    View.prototype.clear = function clear() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    };

    View.prototype.removeOverflowElement = function removeOverflowElement() {
        var length = this.container.childElementCount || this.container.children.length;
        while (length > this.ctrl.control.pageSize) {
            this.container.removeChild(this.container.lastElementChild || this.container.lastChild);
            length--;
        }
    };

    function log(data) {
        web.logger.add(data);
    }

    web.Controller = Controller;
    web.View = View;
    web.setUp = function setUp(config){
        web.logger = new Controller(config);
        web.logger.render(document.body);

        var webConfig = {};
        if (typeof config.filters !== 'undefined') {
            webConfig.filters = typeof config.filters === 'string' ? config.filters.split(',') : config.filters;
        }

        if (typeof config.pageSize !== 'undefined') {
            webConfig.pageSize = config.pageSize;
        }

        if (typeof config.search !== 'undefined') {
            webConfig.search = config.search;
        }

        web.logger.syncControl(webConfig);

        exports.console.on('console', log);
    };

    web.disabled = function disabled(){
        exports.console.removeListener('console', log);
        web.logger.destroy();
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));

if (typeof define === "function" && define.amd) {
	define([], function () { return ConsoleIO; });
}

}());
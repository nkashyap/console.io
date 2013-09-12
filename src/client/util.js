/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 14:24
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * util
 */

(function (exports, global) {

    var util = exports.util = {},
        domReady = false,
        pendingCallback = [];

    util.getScripts = function getScripts() {
        return util.toArray(document.scripts || document.getElementsByName('script'));
    };

    util.getStyles = function getStyles() {
        return util.toArray(document.getElementsByTagName('link'));
    };

    util.getFirstElement = function getFirstElement(element) {
        return element ? (element.firstElementChild || element.firstChild) : false;
    };

    util.getOrigin = function getOrigin() {
        return global.location.origin || global.location.protocol + '//' + (global.location.host || global.location.hostname + ':' + global.location.port);
    };

    util.getHashParams = function getHashParams() {
        var params = {},
            hash = global.location.hash || global.location.href.replace(util.getOrigin() + global.location.pathname, '');

        if (hash) {
            util.forEach(hash.split('#'), function (item) {
                var param = item.split('=');
                params[param[0]] = param[1];
            });
        }

        return params;
    };

    util.getQueryParams = function getQueryParams(url) {
        url = url || global.location.href;

        var params = {},
            queryIndex = url.indexOf('?');

        if (queryIndex > -1) {
            util.forEach(url.substring(queryIndex + 1, url.length).split('&'), function (item) {
                var param = item.split('=');
                params[param[0]] = param[1];
            });
        }

        return params;
    };

    util.queryParams = function queryParams() {
        var params = {},
            scripts = util.getScripts();

        util.every(scripts, function (script) {
            var src = (script.src || script.getAttribute('src') || '').toLowerCase();

            if (src.indexOf('console.io.js') === -1) {
                return true;
            }

            params.secure = src.indexOf('https') > -1;
            util.extend(params, util.getQueryParams(src));

            if (!params.url) {
                /* jshint -W044 */
                var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im'),
                    queryIndex = src.indexOf('?'),
                    url = queryIndex > -1 ? src.substring(0, queryIndex) : src;

                params.url = (params.secure ? 'https://' : 'http://') + url.match(re)[1].toString();
                /* jshint +W044 */
            }

            if (!params.base) {
                params.base = src.indexOf('/console.io/') > -1 ? 'console.io/' : '';
            }

            return false;
        });

        util.extend(params, util.getHashParams());

        return params;
    };

    util.checkFile = function checkFile(url) {
        var isJS = url.indexOf('.js') > -1,
            isCSS = url.indexOf('.css') > -1,
            tags = isJS ? util.getScripts() : isCSS ? util.getStyles() : null,
            attr = isJS ? 'src' : isCSS ? 'href' : null,
            value = false;

        if (tags) {
            util.every(tags, function (element) {
                var path = element.getAttribute(attr) || '';
                value = path.indexOf(url) > -1;
                return !value;
            });
        }

        return value;
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
        if (!global.opera && (node.readyState === "complete" || node.readyState === "loaded")) {
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
                if (!global.opera && (node.readyState === "complete" || node.readyState === "loaded")) {
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

            util.forEach(pendingCallback, function (fn) {
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

    util.addCSSRule = function addCSSRule(sheet, selector, rules, index) {
        try {
            if (sheet.insertRule) {
                sheet.insertRule(selector + "{" + rules + "}", index);
            }
            else if (sheet.addRule) {
                sheet.addRule(selector, rules, index);
            }
        } catch (e) {
        }
    };

    util.deleteCSSRule = function deleteCSSRule(sheet, selector) {
        var rules = sheet.cssRules || sheet.rules;

        util.forEach(util.toArray(rules), function (rule, index) {
            if (rule.selectorText) {
                // firefox switch double colon into single colon
                if (rule.selectorText.replace('::', ':') === selector.replace('::', ':')) {
                    if (sheet.deleteRule) {
                        sheet.deleteRule(index);
                    } else if (sheet.removeRule) {
                        sheet.removeRule(index);
                    }
                }
            }
        });
    };

    util.getAppliedStyles = function getAppliedStyles(element) {
        var win = document.defaultView || global,
            styleNode = [];

        if (win.getComputedStyle) {
            /* Modern browsers */
            var styles = win.getComputedStyle(element, '');

            util.forEach(util.toArray(styles), function (style) {
                styleNode.push(style + ':' + styles.getPropertyValue(style));
            });

        } else if (element.currentStyle) {
            /* IE */
            util.forEachProperty(element.currentStyle, function (value, style) {
                styleNode.push(style + ':' + value);
            });

        } else {
            /* Ancient browser..*/
            util.forEach(util.toArray(element.style), function (style) {
                styleNode.push(style + ':' + element.style[style]);
            });
        }

        return styleNode.join("; ");
    };

    util.getUrl = function getUrl(name) {
        var config = exports.getConfig(),
            url = config.url,
            last = url.length - 1,
            fileUrl = config[name];

        if (url.charAt(last) === '/') {
            url = url.substr(0, last);
        }

        url += (config.base.length > 0 ? '/' + config.base : '/') + fileUrl;

        return url;
    };

    util.showInfo = function showInfo(content, online) {
        var className = "consoleio",
            bgColor = online ? 'rgba(0, 130, 30, 0.8)' : 'rgba(0, 0, 0, 0.8)',
            css = "content: 'Console.IO:" + content + "'; position: fixed; top: 0px; left: 0px; padding: 2px 8px; " +
                "font-size: 12px; font-weight: bold; color: lightgrey; " +
                "background-color: " + bgColor + "; border: 1px solid rgb(0, 0, 0); " +
                "font-family: Monaco,Menlo,Consolas,'Courier New',monospace;";

        util.deleteCSSRule(exports.styleSheet, "." + className + ":after");
        util.addCSSRule(exports.styleSheet, "." + className + ":after", css);
        document.body.setAttribute("class", className);
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

    util.getType = function getType(data) {
        return Object.prototype.toString.apply(data).replace('[object ', '').replace(']', '');
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
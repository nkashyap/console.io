/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

if (typeof window.ConsoleIO === "undefined") {
    window.ConsoleIO = {
        domReady: false,

        namespace: function namespace(name) {
            var ns = name.split('.'),
                i,
                node = window,
                length = ns.length;

            for (i = 0; i < length; i++) {
                node = node[ns[i]] = node[ns[i]] || {};
            }
        },

        ready: function ready(callback) {
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
        },

        every: (function () {
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
        }()),

        forEach: (function () {
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
        }()),

        queryParams: function queryParams(url) {
            var options = {};
            if (url && url.length > 0) {
                url = url.replace(/"/igm, "");

                if (url.indexOf('?') > -1) {
                    url = url.split('?');
                    options.URL = url[0];
                    url = url[1];

                    this.forEach(url.split('&'), function (param) {
                        param = param.split('=');
                        this[param[0]] = param[1];
                    }, options);
                } else {
                    options.URL = url;
                }
            }

            return options;
        },

        cookieToJSON: function cookieToJSON(cookies) {
            var options = {};

            this.forEach(unescape(cookies).split('; '), function (cookie) {
                cookie = cookie.split('=');
                this[cookie[0]] = cookie[1];
            }, options);

            return options;
        },

        forEachProperty: function forEachProperty(obj, callback, scope) {
            var prop;
            for (prop in obj) {
                callback.call(scope || obj, obj[prop], prop, obj);
            }
        },

        toArray: function toArray(data) {
            return Array.prototype.slice.call(data);
        },

        extend: function extend(target, source) {
            this.forEachProperty(source, function (value, property) {
                target[property] = value;
            });

            return target;
        }
    };
}
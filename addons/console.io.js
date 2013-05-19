/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 14:20
 * To change this template use File | Settings | File Templates.
 */

window.ConsoleIO = (function () {

    //"use strict";

    var native = window.console,
        Utils,
        Formatter,
        Stack,
        Wrapper,
        Stringify,
        counters = {},
        timeCounters = {},
        withoutScope = ['dir', 'dirxml'],
        events = {},
        nativeEnabled = true;

    Utils = {
        getObjectType: function getObjectType(data) {
            return Object.prototype.toString.apply(data);
        },

        getFunctionName: function getFunctionName(data) {
            var name;
            // in FireFox, Function objects have a name property...
            if (data) {
                name = (data.getName instanceof Function) ? data.getName() : data.name;
                name = name || data.toString().match(/function\s*([_$\w\d]*)/)[1];
            }
            return name || "anonymous";
        },

        toArray: function toArray(data) {
            return Array.prototype.slice.call(data);
        },

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

        forEachProperty: function forEachProperty(obj, callback, scope) {
            var prop;
            for (prop in obj) {
                callback.call(scope || obj, obj[prop], prop, obj);
            }
        },

        extend: function extend(target, source) {
            this.forEachProperty(source, function (value, property) {
                target[property] = value;
            });

            return target;
        },

        on: function on(eventName, callback) {
            if (!events[eventName]) {
                events[eventName] = [];
            }
            events[eventName].push(callback);
        },

        off: function off(eventName, callback) {
            var callbacks = events[eventName];
            if (callbacks) {
                var index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        }
    };


    // From https://github.com/eriwen/javascript-stacktrace
    Formatter = {
        /**
         * Given an Error object, return a formatted Array based on Chrome's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        chrome: function chrome(e) {
            var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
                replace(/^\s+(at eval )?at\s+/gm, '').
                replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
                replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
            stack.pop();
            return stack;
        },

        /**
         * Given an Error object, return a formatted Array based on Safari's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        safari: function safari(e) {
            return e.stack.replace(/\[native code\]\n/m, '')
                .replace(/^(?=\w+Error\:).*$\n/m, '')
                .replace(/^@/gm, '{anonymous}()@')
                .split('\n');
        },

        /**
         * Given an Error object, return a formatted Array based on IE's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        ie: function ie(e) {
            var lineRE = /^.*at (\w+) \(([^\)]+)\)$/gm;
            return e.stack.replace(/at Anonymous function /gm, '{anonymous}()@')
                .replace(/^(?=\w+Error\:).*$\n/m, '')
                .replace(lineRE, '$1@$2')
                .split('\n');
        },

        /**
         * Given an Error object, return a formatted Array based on Firefox's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        firefox: function firefox(e) {
            return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^[\(@]/gm, '{anonymous}()@').split('\n');
        },

        opera11: function opera11(e) {
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
        },

        opera10b: function opera10b(e) {
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
        },

        /**
         * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        opera10a: function opera10a(e) {
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
        },

        // Opera 7.x-9.2x only!
        opera9: function opera9(e) {
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
        },

        // Safari 5-, IE 9-, and others
        other: function other(curr) {
            var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
            while (curr && curr['arguments'] && stack.length < maxStackSize) {
                fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
                args = Array.prototype.slice.call(curr['arguments'] || []);
                stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
                curr = curr.caller;
            }
            return stack;
        },

        /**
         * Given arguments array as a String, subsituting type names for non-string types.
         *
         * @param {Arguments} args
         * @return {Array} of Strings with stringified arguments
         */
        stringifyArguments: function stringifyArguments(args) {
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
                            result[i] = '[' + this.stringifyArguments(arg) + ']';
                        } else {
                            result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
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
    };


    // From https://github.com/eriwen/javascript-stacktrace
    Stack = {
        create: function create() {
            try {
                undefined();
            } catch (e) {
                return e;
            }
        },

        getType: function getType(e) {
            if (e['arguments'] && e.stack) {
                return 'chrome';

            } else if (e.stack && e.sourceURL) {
                return 'safari';

            } else if (e.stack && e.number) {
                return 'ie';

            } else if (typeof e.message === 'string' && typeof window !== 'undefined' && window.opera) {
                if (!e.stacktrace) {
                    return 'opera9';
                }

                if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                    return 'opera9';
                }

                if (!e.stack) {
                    return 'opera10a';
                }

                if (e.stacktrace.indexOf("called from line") < 0) {
                    return 'opera10b';
                }

                return 'opera11';

            } else if (e.stack) {
                return 'firefox';
            }

            return 'other';
        },

        get: function get(e) {
            e = e || this.create();

            var data = "",
                type = this.getType(e),
                className = Utils.getObjectType(e);

            if (['[object Error]', '[object ErrorEvent]'].indexOf(className) === -1) {
                Wrapper.warn(className + ' error type missing!');
                return data;
            }

            if (type === 'other') {
                data = Formatter.other(arguments.callee);
            } else {
                data = Formatter[type](e);
            }

            return data;
        }
    };


    Wrapper = {
        assert: function assert(x) {
            if (!x) {
                var args = ['Assertion failed:'];
                args = args.concat(Utils.toArray(arguments).slice(1));
                logger("assert", arguments, Stringify.parse(args), Stack.get());
            } else {
                logger("assert", arguments);
            }
        },

        count: function count(key) {
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

            logger("count", arguments, (key || '') + ": " + frameCounter.count);
        },

        time: function time(name, reset) {
            if (!name) {
                return false;
            }

            var key = "KEY" + name.toString();

            if (!reset && timeCounters[key]) {
                return false;
            }

            timeCounters[key] = (new Date()).getTime();

            logger("time", arguments);
        },

        timeEnd: function timeEnd(name) {
            if (!name) {
                return false;
            }

            var key = "KEY" + name.toString(),
                timeCounter = timeCounters[key];

            if (timeCounter) {
                delete timeCounters[key];

                logger("timeEnd", arguments, name + ": " + ((new Date()).getTime() - timeCounter) + "ms");
            }
        },

        debug: function debug() {
            logger("debug", arguments);
        },

        warn: function warn() {
            logger("warn", arguments);
        },

        info: function info() {
            logger("info", arguments);
        },

        log: function log() {
            logger("log", arguments);
        },

        dir: function dir(obj) {
            logger("dir", obj);
        },

        dirxml: function dirxml(node) {
            var value,
                nodeType = node.nodeType;

            if (nodeType === 9) {
                node = node.documentElement;
            }

            value = node ? node.outerHTML || node.innerHTML || node.toString() || Stringify.parse(node) : null;

            if (value) {
                value = value.replace(/</img, '&lt;');
                value = value.replace(/>/img, '&gt;');
            }

            logger("dirxml", node, value);
        },

        group: function group() {
            logger("group", arguments);
        },

        groupCollapsed: function groupCollapsed() {
            logger("groupCollapsed", arguments);
        },

        groupEnd: function groupEnd() {
            logger("groupEnd", arguments);
        },

        markTimeline: function markTimeline() {
            logger("markTimeline", arguments);
        },

        timeStamp: function timeStamp(name) {
            logger("timeStamp", arguments);
        },

        profiles: [],
        profile: function profile(title) {
            logger("profile", arguments);
        },
        profileEnd: function profileEnd(title) {
            logger("profileEnd", arguments);
        },

        error: function error(e) {
            logger("error", arguments, null, Stack.get(e));
        },

        exception: function exception(e) {
            logger("error", arguments, null, Stack.get(e));
        },

        trace: function trace() {
            logger("trace", arguments, null, Stack.get());
        },

        clear: function clear() {
            counters = {};
            timeCounters = {};
            logger("clear", arguments);
        },

        command: function command() {
            logger("command", arguments);
        }
    };


    Stringify = {
        TYPES: [
            '[object Arguments]', '[object Array]',
            '[object String]', '[object Number]', '[object Boolean]',
            '[object Error]', '[object ErrorEvent]',
            '[object Function]', '[object Object]'
        ],

        parse: function parse(data, level, simple) {
            var value = '',
                type = Utils.getObjectType(data);

            level = level || 1;

            if (this.TYPES.indexOf(type) > -1) {
                switch (type) {
                    case '[object Error]':
                    case '[object ErrorEvent]':
                        data = data.message;
                    case '[object String]':
                        value = this.parseString(data);
                        break;

                    case '[object Arguments]':
                        data = Utils.toArray(data);
                    case '[object Array]':
                        value = this.parseArray(data, level);
                        break;

                    case '[object Object]':
                        value = this.parseObject(type, data, level);
                        break;

                    case '[object Number]':
                        value = String(data);
                        break;

                    case '[object Boolean]':
                        value = data ? 'true' : 'false';
                        break;

                    case '[object Function]':
                        value = '"' + Utils.getFunctionName(data) + '"';
                        break;
                }
            } else if (data === null) {
                value = '"null"';

            } else if (data === undefined) {
                value = '"undefined"';

            } else if (simple === undefined) {
                value = this.parseObject(type, data, level);

            } else {
                try {
                    value = String(data);
                } catch (e) {
                    Wrapper.error(e);
                }
            }

            return value;
        },

        valueOf: function valueOf(data, skipGlobal, level) {
            var type = Utils.getObjectType(data);

            if (this.TYPES.indexOf(type) > -1 && !skipGlobal) {
                return this.parse(data, level);
            } else {
                if (type === '[object Function]') {
                    type = '[Function ' + Utils.getFunctionName(data) + ']';
                } else if (data && data.constructor && data.constructor.name) {
                    type = '[object ' + data.constructor.name + ']';
                }

                return type;
            }
        },

        parseString: function parseString(data) {
            return '"' + data.replace(/\n/g, '\\n').replace(/"/g, '\\"').replace(/</g, '').replace(/>/g, '') + '"';
        },

        parseArray: function parseArray(data, level) {
            var target = [];
            Utils.forEach(data, function (item, index) {
                this[index] = Stringify.valueOf(item, false, level);
            }, target);

            if (target.length > 0) {
                return '[' + target.join(', ') + ']';
            } else {
                return '[' + data.toString() + ']';
            }
        },

        parseObject: function parseObject(type, data, level) {
            var name = '',
                skipGlobal = type === '[object global]',
                tabAfter = (new Array(level)).join('\t'),
                tabBefore = (new Array(++level)).join('\t'),
                target = [];

            if (data && data.constructor) {
                name = data.constructor.name;
            }

            Utils.forEachProperty(data, function (value, property) {
                this.push(tabBefore + '"' + property + '": ' + Stringify.valueOf(value, skipGlobal, level));
            }, target);

            if (target.length > 0) {
                return (name || type) + ': {\n' + target.join(',\n') + '\n' + tabAfter + '}\n';
            } else {
                return data.toString() + '\n';
            }
        }
    };


    //IE Fix
    if (Function.prototype.bind && native && typeof native.log === "object") {
        Utils.forEach(["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"],
            function (method) {
                native[method] = this.bind(native[method], native);
            },
            Function.prototype.call
        );
    }

    function emit(eventName, data) {
        var event = events[eventName];
        if (event) {
            Utils.forEach(event, function (callback) {
                callback(data);
            });
        }
    }

    function logger(type, args, value, callStack) {
        if (native && nativeEnabled) {
            if (native[type]) {
                if (withoutScope.indexOf(type) > -1) {
                    native[type](args);
                } else {
                    native[type].apply(native, args);
                }
            }
        }

        if (args && args.hasOwnProperty("length")) {
            if (args.length > 0) {
                args = Utils.toArray(args);
            }
        }

        emit('console', {
            type: type,
            message: value || Stringify.parse(args),
            stack: callStack ? Stringify.parse(callStack) : ''
        });
    }

    window.console = Wrapper;

    return Utils.extend(Utils, {
        native: native
    });
}());
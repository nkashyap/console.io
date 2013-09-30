/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 23/09/13
 * Time: 08:23
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * Profiler
 */

(function (exports, global) {

    var profiler = exports.profiler = {},
        definitionStore = {},
        getProfileId = (function () {
            var i = 0;
            return function () {
                return ['Profile', ++i].join(' ');
            };
        }());

    global.__pb = global.__pe = exports.util.noop;
    global.__pd = function cacheDefinition(file, data) {
        definitionStore[file] = data;
    };

    function setUpWebWorker() {
        var worker = profiler.worker = new global.Worker(exports.util.getUrl('profileWorker'));

        function onMessage(event) {
            if (event.data.type === 'report') {
                exports.transport.emit('profile', event.data.report);
            } else {
                exports.console.log(event.data);
            }
        }

        function onError(event) {
            exports.console.error(event);
        }

        worker.addEventListener('message', onMessage, false);
        worker.addEventListener('error', onError, false);

        profiler.begin = function begin(callId, args, time, reset) {
            if (!reset) {
                var isEvent = exports.util.getType(args[0]).toLowerCase().indexOf('event') > -1;
                if (isEvent && !args[0].__profiled) {
                    reset = isEvent;
                    args[0].__profiled = true;
                }
            }

            if (profiler.enabled) {
                worker.postMessage({
                    type: 'begin',
                    callId: callId,
                    time: time,
                    reset: reset
                });
            }
        };

        profiler.end = function end(callId, time) {
            if (profiler.enabled) {
                worker.postMessage({
                    type: 'end',
                    callId: callId,
                    time: time
                });
            }
        };

        profiler.start = function start(title) {
            title = title || getProfileId();
            profiler.enabled = true;
            profiler.store.push(title);
            worker.postMessage({
                type: 'start',
                title: title
            });

            return title;
        };

        profiler.finish = function finish(title) {
            if (!title) {
                title = profiler.store.pop();
            }

            var index = profiler.store.indexOf(title);
            if (index > -1) {
                profiler.store.splice(index, 1);
            }

            profiler.enabled = profiler.store.length > 0;
            worker.postMessage({
                type: 'finish',
                title: title
            });

            return title;
        };

        profiler.clear = function clear() {
            profiler.enabled = false;
            profiler.store = [];
            worker.postMessage({
                type: 'clear'
            });
        };

        profiler.load = function load(file, table) {
            worker.postMessage({
                type: 'load',
                file: file,
                table: table
            });
        };

        exports.util.forEachProperty(definitionStore, function (data, file) {
            profiler.load(file, data);
        });

        global.__pd = profiler.load;
        global.__pb = profiler.begin;
        global.__pe = profiler.end;
    }

    function setUpAsync() {
        var dataTable = {},
            indexMap = {},
            getUniqueId = (function () {
                var i = 0;
                return function () {
                    return ++i;
                };
            }());

        function ScriptProfileNode(callId, time) {
            var def = dataTable[callId] || ['root', 0, ''];
            this.id = getUniqueId();
            this.functionName = def[0];
            this.lineNumber = def[1];
            this.url = def[2];
            this.callUID = callId;
            this.startTime = time;

            this.totalTime = 0;
            this.selfTime = 0;
            this.numberOfCalls = 1;
            this.visible = true;
            this.children = [];
        }

        ScriptProfileNode.prototype.finish = function finish(callback) {
            this.adjustTime(Date.now());
            exports.util.async(callback);
        };

        ScriptProfileNode.prototype.getNodeByCallerId = function getNodeByCallerId(callId) {
            var node;
            exports.util.every(this.children, function (child) {
                if (child.callUID === callId) {
                    node = child;
                    return false;
                }

                return true;
            });

            return node;
        };

        ScriptProfileNode.prototype.getActiveNode = function getActiveNode() {
            var length = this.children.length;
            return (length > 0) ? this.children[length - 1] : null;
        };

        ScriptProfileNode.prototype.adjustTime = function adjustTime(time) {
            this.totalTime = time - this.startTime;

            if (this.children.length > 0) {
                var childTotalTime = 0;
                util.forEach(this.children, function iterationFn(child) {
                    childTotalTime += child.totalTime;
                }, this);

                if (childTotalTime > this.totalTime) {
                    this.totalTime = childTotalTime;
                }

                this.selfTime = Math.abs(this.totalTime - childTotalTime);
            } else {
                this.selfTime = this.totalTime;
            }
        };

        ScriptProfileNode.prototype.begin = function begin(callId, time) {
            var node = this.getNodeByCallerId(callId);
            if (node) {
                ++node.numberOfCalls;
            } else {
                node = new ScriptProfileNode(callId, time);
                this.children.push(node);
            }
        };

        ScriptProfileNode.prototype.end = function end(callId, time) {
            var node = this.getNodeByCallerId(callId);
            if (node) {
                node.adjustTime(time);
                return true;
            }

            return false;
        };


        function ScriptProfile(title) {
            this.title = title || getProfileId();
            this.uid = profiler.store.length + 1;
            this.head = new ScriptProfileNode(this.uid, Date.now());

            this.active = true;
            this.depth = 0;
        }

        ScriptProfile.prototype.finish = function finish(callback) {
            delete this.active;
            delete this.depth;

            this.head.finish(callback);
        };

        ScriptProfile.prototype.getActiveNode = function getActiveNode(depth) {
            var i = 0,
                node = this.head;

            depth = typeof depth === 'undefined' ? this.depth : depth;

            if (depth > 0) {
                do {
                    node = node.getActiveNode();
                } while (depth > ++i);
            }

            return node;
        };

        ScriptProfile.prototype.begin = function begin(callId, beginTime, reset) {
            if (reset) {
                this.depth = 0;
            }

            if (!indexMap[callId]) {
                indexMap[callId] = [];
            }

            indexMap[callId].push(this.depth);

            this.getActiveNode().begin(callId, beginTime);
            this.depth++;
        };

        ScriptProfile.prototype.end = function end(callId, endTime) {
            this.depth--;
            if (indexMap[callId]) {
                var node = this.getActiveNode(indexMap[callId].pop());
                if (!node.end(callId, endTime)) {
                    exports.console.log(callId + ' failed to find node.');
                }
            } else {
                exports.console.log(callId + ' depth index not mapped.');
            }
        };

        function getActiveProfiles() {
            return exports.util.filter(profiler.store, function (profile) {
                return !!profile.active;
            });
        }

        function getLastActiveProfile() {
            var lastProfile;
            exports.util.every(profiler.store.reverse(), function (profile) {
                if (!!profile.active) {
                    lastProfile = profile;
                    return false;
                }
                return true;
            });

            return lastProfile;
        }

        function getProfileByTitle(title) {
            var lastProfile;
            exports.util.every(profiler.store, function (profile) {
                if (!!profile.active && profile.title === title) {
                    lastProfile = profile;
                    return false;
                }
                return true;
            });

            return lastProfile;
        }

        profiler.begin = function begin(callId, args, beginTime, reset) {
            if (profiler.enabled) {
                if (!reset) {
                    var isEvent = exports.util.getType(args[0]).toLowerCase().indexOf('event') > -1;
                    if (isEvent && !args[0].__profiled) {
                        reset = isEvent;
                        args[0].__profiled = true;
                    }
                }

                exports.util.forEach(getActiveProfiles(), function (profile) {
                    profile.begin(callId, beginTime, reset);
                });
            }
        };

        profiler.end = function end(callId, endTime) {
            if (profiler.enabled) {
                exports.util.forEach(getActiveProfiles(), function (profile) {
                    profile.end(callId, endTime);
                });
            }
        };

        profiler.start = function start(title) {
            var profile = new ScriptProfile(title);
            profiler.store.push(profile);
            profiler.enabled = true;
            return profile.title;
        };

        profiler.finish = function finish(title) {
            var profile;
            if (title) {
                profile = getProfileByTitle(title);
            }

            if (!profile) {
                profile = getLastActiveProfile();
            }

            profiler.enabled = (getActiveProfiles().length > 1);

            if (profile) {
                profile.finish(function () {
                    exports.transport.emit('profile', profile);
                });
                return profile.title;
            }
        };

        profiler.clear = function clear() {
            profiler.enabled = false;
            profiler.store = [];
        };

        profiler.load = function load(file, data) {
            exports.util.forEachProperty(data, function (item) {
                item.push(file);
            });

            exports.util.extend(dataTable, data);
        };

        exports.util.forEachProperty(definitionStore, function (data, file) {
            profiler.load(file, data);
        });

        global.__pd = profiler.load;
        global.__pb = profiler.begin;
        global.__pe = profiler.end;
    }

    profiler.enabled = false;
    profiler.store = [];
    profiler.setUp = function () {
        if (global.Worker) {
            setUpWebWorker();
        } else {
            setUpAsync();
        }
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
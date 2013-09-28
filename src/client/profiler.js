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

    var profiler = exports.profiler = {
        enabled: false,
        store: []
    };

    var getProfileId = (function () {
        var i = 0;
        return function () {
            return ['Profile', ++i].join(' ');
        };
    }());

    global.__pd = global.__pb = global.__pe = function noop() {
    };

    profiler.setUp = function () {
        if (global.Worker) {
            setUpWebWorker();
        } else {
            setUpAsync();
        }
    };

    function setUpWebWorker() {
        var worker = profiler.worker = new Worker(exports.util.getUrl('profileWorker'));

        function onMessage(event) {
            exports.console._native.log(event.data);

            switch (event.data.type) {
                case 'report':
                    exports.transport.emit('profile', event.data.report);
                    break;
            }
        }

        function onError(event) {
            exports.console.error(event);
        }

        worker.addEventListener('message', onMessage, false);
        worker.addEventListener('error', onError, false);

        profiler.begin = function begin(callId, time, reset) {
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
            title = title || profiler.store.pop();
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

        global.__pd = profiler.load;
        global.__pb = profiler.begin;
        global.__pe = profiler.end;
    }


    function setUpAsync() {
        var getUniqueId = (function () {
            var i = 0;
            return function () {
                return ++i;
            };
        }());

        var dataTable = {};

        profiler.begin = function begin(callId, beginTime, reset) {
            if (profiler.enabled) {
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

            if (getActiveProfiles().length === 1) {
                profiler.enabled = false;
            }

            if (profile) {
                profile.finish();
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

        global.__pd = profiler.load;
        global.__pb = profiler.begin;
        global.__pe = profiler.end;


        function ScriptProfileNode(callId, time) {
            var def = dataTable[callId] || ['root', 0, ''];
            this.id = getUniqueId();
            this.functionName = def[0];
            this.lineNumber = def[1];
            this.url = def[2];
            this.callUID = callId;
            this.startTime = time;

            //this.totalTime = 0;
            //this.selfTime = 0;
            this.numberOfCalls = 1;
            this.visible = true;
            this.children = [];
        }

        ScriptProfileNode.prototype.finish = function finish() {
            if (this.children.length > 0) {
                var min, max, endTime;

                exports.util.forEach(this.children, function (child) {
                    child.finish();
                    var endTime = child.totalTime + child.startTime;
                    min = Math.min(min || child.startTime, child.startTime);
                    max = Math.max(max || endTime, endTime);
                });

                endTime = (this.totalTime) ? this.totalTime + this.startTime : Date.now();

                this.totalTime = Math.max(max, endTime) - Math.min(min, this.startTime);
                this.selfTime = this.totalTime - (max - min);
            } else {
                if (!this.totalTime) {
                    this.totalTime = Date.now() - this.startTime;
                }
                this.selfTime = this.totalTime;
            }
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

        ScriptProfileNode.prototype.getNodeById = function getNodeById(id) {
            var node;
            exports.util.every(this.children, function (child) {
                if (child.id === id) {
                    node = child;
                    return false;
                }

                return true;
            });

            if (!node) {
                exports.util.every(this.children, function (child) {
                    node = child.getNodeById(id);
                    if (node) {
                        return false;
                    }

                    return true;
                });
            }

            return node;
        };

        ScriptProfileNode.prototype.getActiveNode = function getActiveNode() {
            var length = this.children.length;
            return (length > 0) ? this.children[length - 1] : null;
        };

        ScriptProfileNode.prototype.begin = function begin(callId, time) {
            var node = this.getNodeByCallerId(callId);
            if (node) {
                ++node.numberOfCalls;
            } else {
                node = new ScriptProfileNode(callId, time);
                this.children.push(node);
            }
            return node.id;
        };

        ScriptProfileNode.prototype.end = function end(callId, time) {
            var node = this.getNodeByCallerId(callId);
            if (node) {
                node.totalTime = time - node.startTime;
            }
        };


        function ScriptProfile(title) {
            this.title = title || getProfileId();
            this.uid = profiler.store.length + 1;
            this.head = new ScriptProfileNode(this.uid, "(root)", "", 0, Date.now());

            this.active = true;
            this.depth = 0;

        }

        ScriptProfile.prototype.finish = function finish() {
            delete this.active;
            delete this.depth;

            this.head.finish();
            exports.transport.emit('profile', this);
        };

        ScriptProfile.prototype.getActiveNode = function getActiveNode() {
            var i = 0,
                nextNode,
                node = this.head;

            while (this.depth > ++i && !!(nextNode = node.getActiveNode())) {
                node = nextNode;
            }

            return node || this.head;
        };

        ScriptProfile.prototype.begin = function begin(callId, beginTime, reset) {
            if (reset) {
                this.depth = 0;
            }

            this.depth++;
            var node = this.getActiveNode();

            node.begin(callId, beginTime);
        };

        ScriptProfile.prototype.end = function end(callId, endTime) {
            var node = this.getActiveNode();
            node.end(callId, endTime);
            this.depth--;
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

    }


}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
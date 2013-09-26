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
        enabled: false
    };

    var getProfileId = (function () {
        var i = 0;
        return function () {
            return ['Profile', ++i].join(' ');
        };
    }());

    var getUniqueId = (function () {
        var i = 0;
        return function () {
            return ++i;
        };
    }());

    function ScriptProfileNode(callId, name, url, line, time) {
        this.id = getUniqueId();
        this.functionName = name;
        this.url = url;
        this.lineNumber = line;
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

    ScriptProfileNode.prototype.begin = function begin(callId, name, file, line, time) {
        var node = this.getNodeByCallerId(callId);
        if (node) {
            ++node.numberOfCalls;
        } else {
            node = new ScriptProfileNode(callId, name, file, line, time);
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

    ScriptProfile.prototype.begin = function begin(callId, name, file, line, parentIds) {
        this.depth++;
        var beginTime = Date.now(),
            parentId = parentIds ? parentIds[this.uid] : null,
            node = parentId ? this.head.getNodeById(parentId) : this.getActiveNode();

        return node.begin(callId, name, file, line, beginTime);
    };

    ScriptProfile.prototype.end = function end(callId, parentIds) {
        var endTime = Date.now(),
            parentId = parentIds ? parentIds[this.uid] : null,
            node = parentId ? this.head.getNodeById(parentId) : this.getActiveNode();

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

    profiler.store = [];
    profiler.begin = function begin(callId, name, file, line, parentIds) {
        if (profiler.enabled) {
            var ids = {};
            exports.util.forEach(getActiveProfiles(), function (profile) {
                ids[profile.uid] = profile.begin(callId, name, file, line, parentIds);
            });
            return ids;
        }
    };

    profiler.end = function end(callId, parentIds) {
        if (profiler.enabled) {
            exports.util.forEach(getActiveProfiles(), function (profile) {
                profile.end(callId, parentIds);
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

    global.__p__ = {
        b: profiler.begin,
        e: profiler.end
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
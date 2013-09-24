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

    var profiler = exports.profiler = {};

    var getProfileId = (function () {
        var i = 0;
        return function () {
            return ['Profile', ++i].join(' ');
        };
    }());

    function ScriptProfileNode(id, name, url, line, time) {
        this.id = id;
        this.functionName = name;
        this.url = url;
        this.lineNumber = line;
        this.callUID = time;

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
                var endTime = child.totalTime + child.callUID;
                min = Math.min(min || child.callUID, child.callUID);
                max = Math.max(max || endTime, endTime);
            });

            endTime = (this.totalTime) ? this.totalTime + this.callUID : Date.now();

            this.totalTime = Math.max(max, endTime) - Math.min(min, this.callUID);
            this.selfTime = this.totalTime - (max - min);
        } else {
            if (!this.totalTime) {
                this.totalTime = Date.now() - this.callUID;
            }
            this.selfTime = this.totalTime;
        }
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

        return node;
    };

    ScriptProfileNode.prototype.getActiveNode = function getActiveNode() {
        var length = this.children.length;
        return (length > 0) ? this.children[length - 1] : null;
    };

    ScriptProfileNode.prototype.begin = function begin(id, name, file, line, time) {
        var node = this.getNodeById(id);
        if (node) {
            ++node.numberOfCalls;
        } else {
            this.children.push(new ScriptProfileNode(id, name, file, line, time));
        }
    };

    ScriptProfileNode.prototype.end = function end(id, time) {
        var node = this.getNodeById(id);
        if (node) {
            node.totalTime = time - node.callUID;
        }
    };


    function ScriptProfile(title) {
        this.title = title || getProfileId();
        this.head = new ScriptProfileNode("(root)", "", "", 0, Date.now());
        this.uid = profiler.store.length + 1;

        this.active = true;
        this.depth = 0;

    }

    ScriptProfile.prototype.finish = function finish() {
        delete this.active;
        delete this.depth;

        this.head.finish();
        exports.console._native.dir(this);
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

    ScriptProfile.prototype.begin = function begin(id, name, file, line) {
        this.depth++;
        var beginTime = Date.now(),
            node = this.getActiveNode();

        node.begin(id, name, file, line, beginTime);
    };

    ScriptProfile.prototype.end = function end(id) {
        var endTime = Date.now();
        this.getActiveNode().end(id, endTime);
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


    profiler.enabled = false;
    profiler.store = [];

    profiler.begin = function begin(id, name, file, line) {
        if (profiler.enabled) {
            exports.util.forEach(getActiveProfiles(), function (profile) {
                profile.begin(id, name, file, line);
            });
        }
    };

    profiler.end = function end(id, name, file, line) {
        if (profiler.enabled) {
            exports.util.forEach(getActiveProfiles(), function (profile) {
                profile.end(id, name, file, line);
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
/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 25/09/13
 * Time: 15:59
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * profileWorker
 */

var dataTable = {},
    store = [],
    util = {};

util.noop = function noop() {
};

util.getUniqueId = (function () {
    var i = 0;
    return function () {
        return ++i;
    };
}());

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

util.filter = (function () {
    if (Array.prototype.filter) {
        return function (array, callback, scope) {
            return (array || []).filter(callback, scope);
        };
    } else {
        return function (array, callback, scope) {
            array = array || [];
            var i = 0, length = array.length, newArray = [];
            if (length) {
                do {
                    if (callback.call(scope || array, array[i], i, array)) {
                        newArray.push(array[i]);
                    }
                } while (++i < length);
            }
            return newArray;
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

util.asyncForEach = function asyncForEach(array, callback, finishCallback, scope) {
    array = [].concat(array || []);
    util.asyncIteration(array, callback || util.noop, finishCallback || util.noop, scope);
};

util.asyncIteration = function asyncIteration(array, callback, finishCallback, scope) {
    if (array.length > 0) {
        setTimeout(function () {
            callback.call(scope || array, array.shift(), function finish() {
                util.asyncIteration(array, callback, finishCallback, scope);
            });
        }, 4);
    } else {
        finishCallback.call(scope);
    }
};


function ScriptProfileNode(callId, time) {
    var def = dataTable[callId] || ['root', 0, ''];
    this.id = util.getUniqueId();
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

ScriptProfileNode.prototype.finish = function finish(callback) {
    if (this.children.length > 0) {
        var min, max;

        util.asyncForEach(this.children,
            function iterationFn(child, finishCallback) {
                child.finish(function childFinishFn() {
                    var endTime = child.totalTime + child.startTime;
                    min = Math.min(min || child.startTime, child.startTime);
                    max = Math.max(max || endTime, endTime);
                    finishCallback();
                });
            },
            function finishFn() {
                var endTime = (this.totalTime) ? this.totalTime + this.startTime : Date.now();
                this.totalTime = Math.max(max, endTime) - Math.min(min, this.startTime);
                this.selfTime = this.totalTime - (max - min);
                callback();
            }, this);
    } else {
        if (!this.totalTime) {
            this.totalTime = Date.now() - this.startTime;
        }
        this.selfTime = this.totalTime;
        callback();
    }
};

ScriptProfileNode.prototype.getNodeByCallerId = function getNodeByCallerId(callId) {
    var node;
    util.every(this.children, function (child) {
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
        node.totalTime = time - node.startTime;
    }
};


function ScriptProfile(title) {
    this.title = title;
    this.uid = store.length + 1;
    this.head = new ScriptProfileNode(this.uid, "(root)", "", 0, Date.now());

    this.active = true;
    this.depth = 0;

}

ScriptProfile.prototype.finish = function finish(callback) {
    delete this.active;
    delete this.depth;

    this.head.finish(callback);
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
    return util.filter(store, function (profile) {
        return !!profile.active;
    });
}

function getProfileByTitle(title) {
    var lastProfile;
    util.every(store, function (profile) {
        if (!!profile.active && profile.title === title) {
            lastProfile = profile;
            return false;
        }
        return true;
    });

    return lastProfile;
}


onmessage = function onMessage(event) {
    var data = event.data;

    switch (data.type) {
        case 'begin':
            util.forEach(getActiveProfiles(), function (profile) {
                profile.begin(data.callId, data.time, data.reset);
            });
            break;

        case 'end':
            util.forEach(getActiveProfiles(), function (profile) {
                profile.end(data.callId, data.time);
            });
            break;

        case 'start':
            store.push(new ScriptProfile(data.title));
            break;

        case 'finish':
            var profile = getProfileByTitle(data.title);
            if (profile) {
                profile.finish(function () {
                    postMessage({
                        type: 'report',
                        report: profile
                    });
                });
            }
            break;

        case 'load':
            util.forEachProperty(data.table, function (item) {
                item.push(data.file);
            });
            util.extend(dataTable, data.table);
            break;

        case 'clear':
            store = [];
            break;
    }
};
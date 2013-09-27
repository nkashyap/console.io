/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 25/09/13
 * Time: 15:59
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

var dataTable = {},
    store = [];

var getUniqueId = (function () {
    var i = 0;
    return function () {
        return ++i;
    };
}());

var every = (function () {
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

var filter = (function () {
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

var forEach = (function () {
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

function forEachProperty(obj, callback, scope) {
    var prop;
    for (prop in obj) {
        callback.call(scope || obj, obj[prop], prop, obj);
    }
}

function extend(target, source) {
    forEachProperty(source, function (value, property) {
        target[property] = value;
    });

    return target;
}



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

        forEach(this.children, function (child) {
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
    every(this.children, function (child) {
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
    every(this.children, function (child) {
        if (child.id === id) {
            node = child;
            return false;
        }

        return true;
    });

    if (!node) {
        every(this.children, function (child) {
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

ScriptProfile.prototype.finish = function finish() {
    delete this.active;
    delete this.depth;

    this.head.finish();
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
    return filter(store, function (profile) {
        return !!profile.active;
    });
}

function getProfileByTitle(title) {
    var lastProfile;
    every(store, function (profile) {
        if (!!profile.active && profile.title === title) {
            lastProfile = profile;
            return false;
        }
        return true;
    });

    return lastProfile;
}

function begin(callId, time, reset) {
    forEach(getActiveProfiles(), function (profile) {
        profile.begin(callId, time, reset);
    });
}

function end(callId, time) {
    forEach(getActiveProfiles(), function (profile) {
        profile.end(callId, time);
    });
}

function start(title) {
    store.push(new ScriptProfile(title));
}

function finish(title) {
    var profile = getProfileByTitle(title);
    if (profile) {
        profile.finish();
        postMessage({
            type: 'report',
            report: profile
        });
    }
}

function clear() {
    store = [];
}

function load(file, data) {
    forEachProperty(data, function(item){
        item.push(file);
    });

    extend(dataTable, data);
}


onmessage = function onMessage(event){
    var data = event.data;

    switch(data.type){
        case 'begin':
            begin(data.callId, data.time, data.reset);
            break;
        case 'end':
            end(data.callId, data.time);
            break;
        case 'start':
            start(data.title);
            break;
        case 'finish':
            finish(data.title);
            break;
        case 'load':
            load(data.file, data.table);
            break;
        case 'clear':
            clear();
            break;
    }
};


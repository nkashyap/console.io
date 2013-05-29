/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 18/05/13
 * Time: 06:27
 * To change this template use File | Settings | File Templates.
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
        }
    };
}

ConsoleIO.namespace("ConsoleIO.Constraint.THEMES");
ConsoleIO.namespace("ConsoleIO.Constraint.IMAGE_URL");
ConsoleIO.namespace("ConsoleIO.Constraint.ICONS");
ConsoleIO.namespace("ConsoleIO.Settings");


ConsoleIO.Settings = {
    secure: false,
    theme: 'web',
    iconPath: 'resources/icons/',
    reloadTabContentWhenActivated: true,
    pageSize: {
        active: 50,
        list: [50, 100, 250, 500]
    }
};

ConsoleIO.Constraint.THEMES = {
    'web': {
        layout: 'dhx_skyblue'
    },
    'terrace': {
        layout: 'dhx_terrace'
    },
    get: function get(type) {
        return ConsoleIO.Constraint.THEMES[ConsoleIO.Settings.theme][type];
    }
};

ConsoleIO.Constraint.IMAGE_URL = {
    'web': {
        tree: "lib/dhtmlx/web/imgs/csh_vista/",
        tab: "lib/dhtmlx/web/imgs/"
    },
    'terrace': {
        tree: "lib/dhtmlx/terrace/imgs/csh_dhx_terrace/",
        tab: "lib/dhtmlx/terrace/imgs/"
    },
    get: function get(type) {
        return ConsoleIO.Constraint.IMAGE_URL[ConsoleIO.Settings.theme][type];
    }
};

ConsoleIO.Constraint.ICONS = {
    ONLINE: 'online.png',
    OFFLINE: 'offline.png',
    SUBSCRIBE: 'subscribe.gif',
    VERSION: 'version.gif',

    //TODO update icons
    PC: 'windows.png',
    //WINDOWS: 'windows.png',
    //LINUX: 'linux.png',
    LG: 'lg.png',
    TV: 'tv.jpg',
    BLUERAY: 'blueray.png',

    //TODO update icons
    GOOGLE: 'chrome.png',
    MICROSOFT: 'explorer.png',
    MOZILLA: 'firefox.png',
    OPERA: 'opera.png',
    APPLE: 'safari.png',

    CHROME: 'chrome.png',
    EXPLORER: 'explorer.png',
    FIREFOX: 'firefox.png',
    OPERA: 'opera.png',
    SAFARI: 'safari.png',

    JAVASCRIPT: 'javascript.gif',
    STYLESHEET: 'stylesheet.gif',
    WEB: 'web.png',
    FILE: '',
    FOLDEROPEN: '../../' + ConsoleIO.Constraint.IMAGE_URL.get('tree') + '/folderOpen.gif'
};


ConsoleIO.ready(function () {
    if (ConsoleIO.domReady) {
        return;
    }

    ConsoleIO.domReady = true;

    // CodeMirror setup
    (function (CodeMirror, ConsoleIO) {

        CodeMirror.commands.autocomplete = function autocomplete(cm) {
            CodeMirror.showHint(cm, CodeMirror.javascriptHint);
        };

        CodeMirror.commands.submit = function submit(cm) {
            var cmd = cm.getValue();
            if (cmd) {
                ConsoleIO.Service.Socket.emit('execute', {
                    guid: ConsoleIO.myApp.getActiveDeviceGuid(),
                    code: cmd
                });
            }
        };

    }(CodeMirror, ConsoleIO));

    ConsoleIO.Service.Socket.connect();
    ConsoleIO.myApp = new ConsoleIO.App();
    ConsoleIO.myApp.render();
});
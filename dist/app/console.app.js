/**
 * Name: console.io
 * Version: 0.2.0-1
 * Description: Javascript Remote Web Console
 * Website: http://nkashyap.github.io/console.io/
 * Author: Nisheeth Kashyap
 * Email: nisheeth.k.kashyap@gmail.com
 * Date: 2013-09-18
*/

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

        isArray: Array.isArray || function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },

        extend: function extend(target, source) {
            this.forEachProperty(source, function (value, property) {
                target[property] = value;
            });

            return target;
        },

        async: function async(fn, scope, timeout) {
            return setTimeout(function () {
                fn.call(scope);
            }, timeout);
        },

        addCSSRule: function addCSSRule(selector, rules, index) {
            var sheet = ConsoleIO.styleSheet;
            try {
                if (sheet.insertRule) {
                    sheet.insertRule(selector + "{" + rules + "}", index);
                }
                else if (sheet.addRule) {
                    sheet.addRule(selector, rules, index);
                }
            } catch (e) {
            }
        },

        deleteCSSRule: function deleteCSSRule(selector) {
            var sheet = ConsoleIO.styleSheet,
                rules = sheet.cssRules || sheet.rules;

            this.forEach(this.toArray(rules), function (rule, index) {
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
        }
    };
}

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.Service.Socket");

ConsoleIO.Service.Socket = {
    io: null,
    name: null,
    guid: null,
    connectionMode: null,

    connect: function init() {
        ConsoleIO.Service.Socket.guid = ConsoleIO.Service.Storage.getItem('guid');

        if (!ConsoleIO.Service.Socket.guid) {
            ConsoleIO.Service.Socket.guid = ((new Date().getTime()) + "-" + Math.random()).replace(".", "");
            ConsoleIO.Service.Storage.addItem('guid', ConsoleIO.Service.Socket.guid, 365);
        }

        this.io = window.io.connect(window.location.origin, {
            secure: window.location.origin.indexOf("https") > -1,
            resource: (window.location.pathname.split('/').slice(0, -1).join('/') + '/socket.io').substring(1),
            'sync disconnect on unload': true
        });

        // set events
        this.io.on('connect', this.onConnect);
        this.io.on('connecting', this.onConnecting);
        this.io.on('reconnect', this.onReconnect);
        this.io.on('reconnecting', this.onReconnecting);
        this.io.on('disconnect', this.onDisconnect);
        this.io.on('connect_failed', this.onConnectFailed);
        this.io.on('reconnect_failed', this.onReconnectFailed);
        this.io.on('error', this.onError);

        this.io.on('user:ready', this.onReady);
        this.io.on('user:online', this.onOnline);
        this.io.on('user:offline', this.onOffline);
        this.io.on('user:disconnect', this.onUserDisconnect);
    },

    emit: function emit(name, data) {
        if (this.io && this.io.socket.connected) {
            data = data || {};

            if (!data.guid && ConsoleIO.Service.Socket.guid) {
                data.guid = ConsoleIO.Service.Socket.guid;
            }

            this.io.emit('user:' + name, data);
        }
    },

    on: function on(name, callback, scope) {
        this.io.on(name, function () {
            callback.apply(scope || this, arguments);
        });
    },

    off: function off(name, callback, scope) {
        this.io.removeListener(name, function () {
            callback.apply(scope || this, arguments);
        });

        if (!ConsoleIO.isArray(this.io.$events[name])) {
            delete this.io.$events[name];
        }
    },

    forceReconnect: function forceReconnect() {
        try {
            var scope = ConsoleIO.Service.Socket;
            scope.io.socket.disconnectSync();
            scope.io.socket.reconnect();
        } catch (e) {
            console.warn(e);
        }
    },

    onReady: function onReady(data) {
        var scope = window.ConsoleIO.extend(ConsoleIO.Service.Socket, data);
        console.log('onReady', scope.name);
    },

    onOnline: function onOnline(data) {
        var scope = window.ConsoleIO.extend(ConsoleIO.Service.Socket, data);
        console.log('Online', scope.name);
    },

    onOffline: function onOffline(data) {
        var scope = window.ConsoleIO.extend(ConsoleIO.Service.Socket, data);
        console.log('Offline', scope.name);
    },

    onUserDisconnect: function onUserDisconnect(data) {
        var scope = window.ConsoleIO.extend(ConsoleIO.Service.Socket, data);
        scope.forceReconnect();

        console.log('user disconnected', scope.name);
    },

    onConnect: function onConnect() {
        ConsoleIO.Service.Socket.emit('setUp');
        console.log('Connected to the Server', arguments);
    },

    onConnecting: function onConnecting(mode) {
        ConsoleIO.Service.Socket.connectionMode = mode;
        console.log('Connecting to the Server', mode);
    },

    onReconnect: function onReconnect(mode, attempts) {
        ConsoleIO.Service.Socket.connectionMode = mode;
        console.log('Reconnected to the Server after ' + attempts + ' attempts.', mode, attempts);
    },

    onReconnecting: function onReconnecting() {
        console.log('Reconnecting to the Server', arguments);
    },

    onDisconnect: function onDisconnect(reason) {
        console.log('Disconnected from the Server', reason);
        if (!reason || (reason && reason !== 'booted')) {
            ConsoleIO.Service.Socket.forceReconnect();
        }
    },

    onConnectFailed: function onConnectFailed() {
        console.warn('Failed to connect to the Server', arguments);
    },

    onReconnectFailed: function onReconnectFailed() {
        console.warn('Failed to reconnect to the Server', arguments);
    },

    onError: function onError(e) {
        console.warn('Socket Error', e);
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 26/08/13
 * Time: 09:39
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * Storage
 */

ConsoleIO.namespace("ConsoleIO.Service.Storage");

ConsoleIO.Service.Storage = {
    Store: {},

    addItem: function addItem(name, value, days) {
        if (!value || value === 'undefined') {
            return;
        }

        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }

        document.cookie = name + "=" + value + expires + "; path=/";
        ConsoleIO.Service.Storage.Store[name] = value;
    },

    removeItem: function removeItem(name) {
        this.addItem(name, '', -1);
        delete ConsoleIO.Service.Storage.Store[name];
    },

    getItem: function getItem(name) {
        return ConsoleIO.Service.Storage.Store[name];
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.Service.DHTMLXHelper");

ConsoleIO.Service.DHTMLXHelper = {
    populateToolbar: function populateToolbar(items, toolbar) {
        ConsoleIO.forEach(items, function (item, index) {
            switch (item.type) {
                case 'button':
                    this.addButton(item.id, index, item.text, item.imgEnabled, item.imgDisabled);
                    break;
                case 'separator':
                    this.addSeparator('separator+' + index, index);
                    break;
                case 'twoState':
                    this.addButtonTwoState(item.id, index, item.text, item.imgEnabled, item.imgDisabled);
                    this.setItemState(item.id, !!item.pressed);
                    break;
                case 'select':
                    if (item.opts === 'pagesizes') {
                        item.opts = [];
                        ConsoleIO.forEach(ConsoleIO.Settings.pageSize.list, function (number) {
                            item.opts.push([item.id + '-' + number, 'obj', number]);
                        });
                        item.selected = item.id + '-' + ConsoleIO.Settings.pageSize.active;
                    }

                    this.addButtonSelect(item.id, index, item.text, item.opts, item.imgEnabled, item.imgDisabled);

                    if (item.selected) {
                        this.setListOptionSelected(item.id, item.selected);
                    }
                    break;
                case 'text':
                    this.addText(item.id, index, item.text);
                    break;
                case 'input':
                    this.addInput(item.id, index, item.value);
                    break;
            }

            if (item.disabled) {
                this.disableItem(item.id);
            }

            if (item.width) {
                this.setWidth(item.id, item.width);
            }

            if (item.tooltip) {
                this.setItemToolTip(item.id, item.tooltip);
            }
        }, toolbar);
    },

    elements: {},

    createElement: function createElement(config) {
        config.tag = config.tag || 'div';
        if (!this.elements[config.tag]) {
            this.elements[config.tag] = document.createElement(config.tag);
        }

        var element = this.elements[config.tag].cloneNode(false);

        ConsoleIO.forEachProperty(config.attr, function (value, property) {
            if (value) {
                element.setAttribute(property, value);
            }
        });

        ConsoleIO.forEachProperty(config.prop, function (value, property) {
            if (value) {
                element[property] = value;
            }
        });

        if (config.target) {
            if (config.insert && config.insert === 'top') {
                config.target.insertBefore(element, config.target.firstElementChild || config.target.firstChild);
            } else {
                config.target.appendChild(element);
            }
        }

        return element;
    },

    stripBrackets: function stripBrackets(data) {
        var last = data.length - 1;
        if (data.charAt(0) === '[' && data.charAt(last) === ']') {
            return data.substring(1, last);
        }
        return data;
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.Model.DHTMLX");

ConsoleIO.Model.DHTMLX = {
    ToolBarItem: {
        Separator: { type: 'separator' },

        //Back: { id: 'back', type: 'select', text: 'Back', opts: [], imgEnabled: 'back.gif', imgDisabled: 'back_dis.gif', tooltip: 'Back in History' },
        //Forward: { id: 'forward', type: 'select', text: 'Forward', opts: [], imgEnabled: 'forward.gif', imgDisabled: 'forward_dis.gif', tooltip: 'Forward in History' },

        PageSize: { id: 'pagesize', type: 'select', text: 'PageSize', imgEnabled: 'pagesize.gif', tooltip: 'Page Size', width: 90, opts: 'pagesizes' },
        Preview: { id: 'preview', type: 'button', text: 'Preview', imgEnabled: 'preview.gif', imgDisabled: 'preview_dis.gif', tooltip: 'Preview' },
        ScreenShot: { id: 'screenShot', type: 'button', text: 'Capture', imgEnabled: 'screenshot.png', imgDisabled: 'screenshot_dis.png', tooltip: 'ScreenShot' },

        DeviceNameLabel: { id: 'deviceNameLabel', type: 'text', text: 'Device Name:', tooltip: 'Device Name' },
        DeviceNameText: { id: 'deviceNameText', type: 'input', value: '', width: 120, tooltip: 'Enter Device Name' },
        DeviceNameSet: { id: 'deviceNameSet', type: 'button', imgEnabled: 'go.png', tooltip: 'Set Device Name' },

        SearchText: { id: 'searchText', type: 'input', value: '', width: 100, tooltip: 'Search Text' },
        Search: { id: 'search', type: 'button', imgEnabled: 'search.gif', imgDisabled: 'search_dis.gif', tooltip: 'Search' },
        Execute: { id: 'execute', type: 'button', text: 'Execute', imgEnabled: 'execute.png', imgDisabled: 'execute_dis.png', tooltip: 'Execute Script' },

        Clear: { id: 'clear', type: 'button', text: 'Clear', imgEnabled: 'clear.gif', tooltip: 'Clear' },
        Refresh: { id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: 'refresh.gif', tooltip: 'Refresh' },
        Reload: { id: 'reload', type: 'button', text: 'Reload', imgEnabled: 'reload.png', tooltip: 'Reload Browser' },

        Open: { id: 'open', type: 'select', text: 'Open', imgEnabled: 'open.gif', imgDisabled: 'open_dis.gif', tooltip: 'Open', opts: [] },
        Save: { id: 'save', type: 'select', text: 'Save', imgEnabled: 'save.gif', imgDisabled: 'save_dis.gif', tooltip: 'Save', disabled: true, opts: [
            ['saveAs', 'obj', 'Save As', 'save_as.gif']
        ]},
        Export: { id: 'export', type: 'button', text: 'Export', imgEnabled: 'downloads.gif', tooltip: 'Export' },

        Undo: { id: 'undo', type: 'button', text: 'Undo', imgEnabled: 'undo.gif', imgDisabled: 'undo_dis.gif', tooltip: 'Undo', disabled: true },
        Redo: { id: 'redo', type: 'button', text: 'Redo', imgEnabled: 'redo.gif', imgDisabled: 'redo_dis.gif', tooltip: 'Redo', disabled: true },

        SelectAll: { id: 'selectAll', type: 'button', text: 'Select All', imgEnabled: 'select_all.gif', tooltip: 'Select All' },
        Cut: { id: 'cut', type: 'button', text: 'Cut', imgEnabled: 'cut.gif', imgDisabled: 'cut_dis.gif', tooltip: 'Cut' },
        Copy: { id: 'copy', type: 'button', text: 'Copy', imgEnabled: 'copy.gif', imgDisabled: 'copy_dis.gif', tooltip: 'Copy' },
        Paste: { id: 'paste', type: 'button', text: 'Paste', imgEnabled: 'paste.gif', imgDisabled: 'paste_dis.gif', tooltip: 'Paste' },

        Web: { id: 'web', type: 'twoState', text: 'Web Console', imgEnabled: 'console.gif', tooltip: 'Web Console', pressed: false },
        PlayPause: { id: 'playPause', type: 'twoState', text: 'Pause', imgEnabled: 'pause.png', tooltip: 'Pause logs', pressed: false },
        WordWrap: { id: 'wordwrap', type: 'twoState', text: 'Word-Wrap', imgEnabled: 'word_wrap.gif', tooltip: 'Word Wrap', pressed: false },

        FilterLabel: { id: 'filterLabel', type: 'text', text: 'Filters:', tooltip: 'Filter Console Logs' },
        Info: { id: 'filter-info', type: 'twoState', text: 'Info', imgEnabled: 'info.gif', tooltip: 'Info', pressed: false },
        Log: { id: 'filter-log', type: 'twoState', text: 'Log', imgEnabled: 'log.png', tooltip: 'Log', pressed: false },
        Warn: { id: 'filter-warn', type: 'twoState', text: 'Warn', imgEnabled: 'warn.png', tooltip: 'Warn', pressed: false },
        Debug: { id: 'filter-debug', type: 'twoState', text: 'Debug', imgEnabled: 'debug.gif', tooltip: 'Debug', pressed: false },
        Error: { id: 'filter-error', type: 'twoState', text: 'Error', imgEnabled: 'error.gif', tooltip: 'Error', pressed: false }
    }
};


/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.App");

ConsoleIO.View.App = function AppView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.layout = null;
    this.statusBar = null;
};

ConsoleIO.View.App.prototype.render = function render() {
    this.layout = new dhtmlXLayoutObject(this.model.target, this.model.type, ConsoleIO.Constant.THEMES.get('layout'));

    this.layout.cont.obj._offsetTop = 5; // top margin
    this.layout.cont.obj._offsetLeft = 5; // left margin
    this.layout.cont.obj._offsetHeight = -10; // bottom margin
    this.layout.cont.obj._offsetWidth = -10; // right margin

    this.layout.setSizes();
    this.layout.setEffect("resize", true);

    this.statusBar = this.layout.attachStatusBar();

    this.offline();
};

ConsoleIO.View.App.prototype.getContextById = function getContextById(contextId) {
    return this.layout ? this.layout.cells(contextId) : null;
};

ConsoleIO.View.App.prototype.online = function online() {
    var icon = '<img src="' + ConsoleIO.Settings.iconPath + 'online.png" class="status">';
    this.statusBar.setText(icon + this.model.status);
};

ConsoleIO.View.App.prototype.offline = function offline() {
    var icon = '<img src="' + ConsoleIO.Settings.iconPath + 'offline.png" class="status">';
    this.statusBar.setText(icon + this.model.status);
};

ConsoleIO.View.App.prototype.notify = function notify(data) {
    console.log(data);
};

ConsoleIO.View.App.prototype.getContextById = function getContextById(contextId) {
    return this.layout ? this.layout.cells(contextId) : null;
};

ConsoleIO.View.App.prototype.setTitle = function setTitle(contextId, title) {
    if (this.layout) {
        this.layout.cells(contextId).setText(title);
        this.layout.setCollapsedText(contextId, title);
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device");

ConsoleIO.View.Device = function DeviceView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.tabs = null;
};

ConsoleIO.View.Device.prototype.render = function render(target) {
    this.target = target;
    this.tabs = this.target.attachTabbar();
    this.tabs.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('tab'));
    this.tabs.attachEvent("onTabClick", function (tabId) {
        this.onTabClick(tabId);
    }, this.ctrl);
};

ConsoleIO.View.Device.prototype.destroy = function destroy() {
    this.tabs.clearAll();
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Browser");

ConsoleIO.View.Browser = function BrowserView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.tree = null;
    this.target = null;
    this.toolbar = null;
};

ConsoleIO.View.Browser.prototype.render = function render(target) {
    var scope = this;
    this.target = target;
    this.target.setWidth(this.model.width);
    this.target.setHeight(this.model.height);

    this.toolbar = this.target.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);

    this.tree = this.target.attachTree();
    this.tree.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('tree'));
    this.tree.setIconPath(ConsoleIO.Settings.iconPath);
    this.tree.enableHighlighting(true);
    this.tree.enableTreeImages(true);
    this.tree.enableTreeLines(true);
    this.tree.enableIEImageFix(true);
    this.tree.attachEvent("onDblClick", function (itemId) {
        if (!scope.tree.hasChildren(itemId)) {
            scope.ctrl.subscribe(itemId);
        }
    });

    this.tree.attachEvent("onOpenEnd", function (itemId, state) {
        if (scope.tree.hasChildren(itemId)) {
            this.openNode(itemId, state);
        }
    }, this.ctrl);
};

ConsoleIO.View.Browser.prototype.add = function add(id, name, parentId, icon) {
    if (!this.tree.getParentId(id)) {
        if (icon) {
            this.tree.insertNewItem(parentId, id, name, 0, icon, icon, icon);
        } else {
            this.tree.insertNewItem(parentId, id, name);
        }
    }
};

ConsoleIO.View.Browser.prototype.addOrUpdate = function addOrUpdate(id, name, parentId, icon) {
    if (this.tree.getParentId(id)) {
        this.tree.deleteItem(id);
    }

    if (icon) {
        this.tree.insertNewItem(parentId, id, name, 0, icon, icon, icon);
    } else {
        this.tree.insertNewItem(parentId, id, name);
    }
};

ConsoleIO.View.Browser.prototype.setIcon = function setIcon(id, icon) {
    this.tree.setItemImage(id, icon);
};

ConsoleIO.View.Browser.prototype.deleteItem = function deleteItem(id) {
    this.tree.deleteItem(id);
};

ConsoleIO.View.Browser.prototype.closeItem = function closeItem(id, closeAll) {
    if (!closeAll) {
        this.tree.closeItem(id);
    } else {
        this.tree.closeAllItems(id);
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Console");

ConsoleIO.View.Device.Console = function ConsoleView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.tab = null;
    this.toolbar = null;
    this.id = [this.model.name, this.model.serialNumber].join("-");
    this.container = ConsoleIO.Service.DHTMLXHelper.createElement({
        attr: {
            id: 'console-' + this.id
        }
    });
};

ConsoleIO.View.Device.Console.prototype.render = function render(target) {
    this.target = target;
    this.target.addTab(this.id, this.model.name);
    this.target.setContent(this.id, this.container);
    this.tab = this.target.cells(this.id);

    this.toolbar = this.tab.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);

    this.toolbar.attachEvent("onStateChange", function (itemId, state) {
        this.onButtonClick(itemId, state);
    }, this.ctrl);

    this.toolbar.attachEvent("onEnter", function (itemId, value) {
        this.applySearch(value);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};

ConsoleIO.View.Device.Console.prototype.destroy = function destroy() {
    this.clear();
    this.container.parentNode.removeChild(this.container);
    this.target.removeTab(this.id, true);
};

ConsoleIO.View.Device.Console.prototype.getElementData = function getElementData(data) {

    data.message = unescape(data.message);

    var tag = 'code',
        css = data.type,
        origin = data.origin,
        originClass,
        stackMessage,
        messagePreview,
        message = ConsoleIO.Service.DHTMLXHelper.stripBrackets(data.message);

    // check if asset failed
    if (data.type === "assert") {
        var asset = ConsoleIO.Service.DHTMLXHelper.stripBrackets(message).split(",");
        if (asset[0].toLowerCase() !== "true") {
            css = "assert-failed";
        }
    }

    // for Opera and Maple browser
    message = message.replace(/%20/img, " ");

    // switch to pre mode if message contain object
    if (message.indexOf("{") > -1 && message.indexOf("}") > -1) {
        tag = 'pre';
    }

    messagePreview = prettyPrintOne(message);

    if (data.stack) {
        var stack = data.stack.split(",")
            .join("\n")
            .replace(/"/img, '')
            .replace(/%20/img, ' ');

        stackMessage = ConsoleIO.Service.DHTMLXHelper.stripBrackets(stack);
        messagePreview += '\n' + prettyPrintOne(stackMessage);
    }

    if (['assert', 'dir', 'dirxml', 'error', 'trace'].indexOf(data.type) > -1) {
        tag = 'pre';
    }

    if (origin) {
        origin = data.origin.replace(/(\/|:|\.)/igm, '');
        originClass = "content: 'iframe:" + data.origin + "'; position: absolute; top: 0px; right: 0px; padding: 2px 8px; " +
            "font-size: 12px; color: lightgrey; " +
            "background-color: rgba(0, 0, 0, 0.6); " +
            "font-family: Monaco,Menlo,Consolas,'Courier New',monospace;";

        ConsoleIO.deleteCSSRule('.' + origin + ":before");
        ConsoleIO.addCSSRule('.' + origin + ":before", originClass);
    }

    return {
        tag: tag,
        className: 'console type-' + css + (origin ? ' ' + origin : ''),
        message: (messagePreview || '.')
    };
};

ConsoleIO.View.Device.Console.prototype.add = function add(data) {
    var element = this.getElementData(data);

    ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: element.tag,
        attr: {
            'class': element.className
        },
        prop: {
            innerHTML: element.message
        },
        target: this.container,
        insert: 'top'
    });

    this.removeOverflowElement();
};

ConsoleIO.View.Device.Console.prototype.addBatch = function addBatch(store) {
    if (store.length > 0) {
        var fragment = document.createDocumentFragment();

        ConsoleIO.forEach(store, function (item) {
            var element = this.getElementData(item);
            ConsoleIO.Service.DHTMLXHelper.createElement({
                tag: element.tag,
                attr: {
                    'class': element.className
                },
                prop: {
                    innerHTML: element.message
                },
                target: fragment,
                insert: 'bottom'
            });
        }, this);

        this.container.insertBefore(fragment, this.container.firstElementChild || this.container.firstChild);
        this.removeOverflowElement();
    }
};

ConsoleIO.View.Device.Console.prototype.getHTML = function getHTML() {
    return this.container.innerHTML;
};

ConsoleIO.View.Device.Console.prototype.getValue = function getValue(id) {
    return this.toolbar.getValue(id);
};

ConsoleIO.View.Device.Console.prototype.clear = function clear() {
    while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
    }
};

ConsoleIO.View.Device.Console.prototype.removeOverflowElement = function removeOverflowElement() {
    var length = this.container.childElementCount || this.container.children.length;
    while (length > ConsoleIO.Settings.pageSize.active) {
        this.container.removeChild(this.container.lastElementChild || this.container.lastChild);
        length--;
    }
};

ConsoleIO.View.Device.Console.prototype.setItemState = function setItemState(id, state) {
    if (this.toolbar) {
        this.toolbar.setItemState(id, state);
    }
};

ConsoleIO.View.Device.Console.prototype.setValue = function setValue(id, text) {
    if (this.toolbar) {
        this.toolbar.setValue(id, text);
    }
};


/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Explorer");

ConsoleIO.View.Device.Explorer = function ExplorerView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.tree = null;
    this.target = null;
    this.toolbar = null;
};

ConsoleIO.View.Device.Explorer.prototype.render = function render(target) {
    var scope = this;
    this.target = target;
    this.target.setWidth(this.model.width);

    this.toolbar = this.target.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);

    this.tree = this.target.attachTree();
    this.tree.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('tree'));
    this.tree.setIconPath(ConsoleIO.Settings.iconPath);
    this.tree.enableHighlighting(true);
    this.tree.enableTreeImages(true);
    this.tree.enableTreeLines(true);
    this.tree.enableIEImageFix(true);

    this.tree.attachEvent("onDblClick", function (itemId) {
        if (!scope.tree.hasChildren(itemId)) {
            this.viewFile(itemId);
        }
    }, this.ctrl);

    this.tree.attachEvent("onOpenEnd", function (itemId, state) {
        if (scope.tree.hasChildren(itemId)) {
            this.openNode(itemId, state);
        }
    }, this.ctrl);
};

ConsoleIO.View.Device.Explorer.prototype.destroy = function destroy() {
    this.tree.destructor();
};

ConsoleIO.View.Device.Explorer.prototype.add = function add(id, name, parentId, icon) {
    if (icon) {
        this.tree.insertNewItem(parentId, id, name, 0, icon, icon, icon);
    } else {
        this.tree.insertNewItem(parentId, id, name);
    }
};

ConsoleIO.View.Device.Explorer.prototype.setIcon = function setIcon(id, icon) {
    this.tree.setItemImage(id, icon);
};

ConsoleIO.View.Device.Explorer.prototype.deleteItem = function deleteItem(id) {
    this.tree.deleteItem(id);
};

ConsoleIO.View.Device.Explorer.prototype.closeItem = function closeItem(id, closeAll) {
    if (!closeAll) {
        this.tree.closeItem(id);
    } else {
        this.tree.closeAllItems(id);
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Preview");

ConsoleIO.View.Device.Preview = function PreviewView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.toolbar = null;
    this.tab = null;
    this.dhxWins = null;
    this.previewFrame = null;
    this.image = null;
    this.id = [this.model.name, this.model.serialNumber].join("-");
};

ConsoleIO.View.Device.Preview.prototype.render = function render(target) {
    this.target = target;
    this.target.addTab(this.id, this.model.name);
    this.tab = this.target.cells(this.id);

    this.toolbar = this.tab.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);

    this.toolbar.attachEvent("onStateChange", function (itemId, state) {
        this.onButtonClick(itemId, state);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);

    this.previewFrame = ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: 'iframe',
        attr: {
            height: '100%',
            width: '100%'
        },
        target: document.body
    });

    this.image = ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: 'img',
        target: document.body
    });

    this.dhxWins = new dhtmlXWindows();
    this.dhxWins.enableAutoViewport(true);
    this.dhxWins.attachViewportTo(document.body);
    this.dhxWins.setSkin(ConsoleIO.Constant.THEMES.get('win'));
    this.dhxWins.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('win'));
};

ConsoleIO.View.Device.Preview.prototype.destroy = function destroy() {
    document.body.removeChild(this.previewFrame);
    document.body.removeChild(this.image);
    this.dhxWins.unload();
    this.target.removeTab(this.id, true);
};

ConsoleIO.View.Device.Preview.prototype.toggleButton = function toggleButton(id, state) {
    if (this.toolbar) {
        if (state) {
            this.toolbar.enableItem(id);
        } else {
            this.toolbar.disableItem(id);
        }
    }
};

ConsoleIO.View.Device.Preview.prototype.preview = function preview(data) {
    if (this.dhxWins) {
        this.previewFrame.src = "data:text/html," + escape(data.content);

        var win = this.dhxWins.createWindow("preview", 0, 0, 900, 700);
        win.setText("Preview");
        win.button('park').hide();
        win.keepInViewport(true);
        win.setModal(true);
        win.centerOnScreen();
        win.button("close").attachEvent("onClick", function () {
            win.detachObject(this.previewFrame);
            win.close();
        }, this);
        win.attachObject(this.previewFrame);
    }
};

ConsoleIO.View.Device.Preview.prototype.screenShot = function screenShot(data) {
    if (this.dhxWins) {
        if (data.screen) {
            this.image.src = data.screen;

            var win = this.dhxWins.createWindow("screen", 0, 0, 900, 700);
            win.setText("Capture");
            win.button('park').hide();
            win.keepInViewport(true);
            win.setModal(true);
            win.centerOnScreen();
            win.button("close").attachEvent("onClick", function () {
                win.detachObject(this.image);
                win.close();
            }, this);

            win.attachObject(this.image);
        } else {
            alert("Sorry!, Console.IO was unable to capture screen. Check console for more details.");
        }
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Source");

ConsoleIO.View.Device.Source = function SourceView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.toolbar = null;
    this.layout = null;
    this.tab = null;
    this.id = [this.model.name, this.model.serialNumber].join("-");
};

ConsoleIO.View.Device.Source.prototype.render = function render(target) {
    this.target = target;
    this.target.addTab(this.id, this.model.name);
    this.tab = this.target.cells(this.id);
    this.layout = this.tab.attachLayout("2U");

    this.toolbar = this.getContextById(this.ctrl.context.source).attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);

    this.toolbar.attachEvent("onStateChange", function (itemId, state) {
        this.onButtonClick(itemId, state);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};

ConsoleIO.View.Device.Source.prototype.destroy = function destroy() {
    this.target.removeTab(this.id, true);
};

ConsoleIO.View.Device.Source.prototype.getContextById = function getContextById(contextId) {
    return this.layout ? this.layout.cells(contextId) : null;
};

ConsoleIO.View.Device.Source.prototype.setTitle = function setTitle(contextId, title) {
    if (this.layout) {
        this.layout.cells(contextId).setText(title);
        this.layout.setCollapsedText(contextId, title);
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Status");

ConsoleIO.View.Device.Status = function StatusView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.toolbar = null;
    this.tab = null;
    this.accordion = null;
    this.id = [this.model.name, this.model.serialNumber].join("-");
    this.grids = {};
};

ConsoleIO.View.Device.Status.prototype.render = function render(target) {
    this.target = target;
    this.target.addTab(this.id, this.model.name);
    this.target.setTabActive(this.id);
    this.tab = this.target.cells(this.id);

    this.toolbar = this.tab.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);

    this.toolbar.attachEvent("onStateChange", function (itemId, state) {
        this.onButtonClick(itemId, state);
    }, this.ctrl);

    this.accordion = this.tab.attachAccordion();
    this.accordion.setIconsPath(ConsoleIO.Settings.iconPath);
    this.accordion.attachEvent("onActive", function (itemId) {
        this.activeTab = itemId.replace(this.view.id + '-', '');
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};

ConsoleIO.View.Device.Status.prototype.destroy = function destroy() {
    this.target.removeTab(this.id, true);
};

ConsoleIO.View.Device.Status.prototype.clear = function clear() {
    if (this.accordion) {
        ConsoleIO.forEachProperty(this.grids, function (grid) {
            grid.destructor();
        }, this);

        this.grids = {};

        var scope = this;
        this.accordion.forEachItem(function (item) {
            scope.accordion.removeItem(item.getId());
        });
    }
};

ConsoleIO.View.Device.Status.prototype.getUniqueId = (function () {
    var i = 0;
    return function getUniqueId(id, name) {
        return [id, name, ++i].join('-');
    };
}());

ConsoleIO.View.Device.Status.prototype.open = function open(name) {
    var id = this.id + "-" + name;

    if (this.accordion.cells(id)) {
        this.accordion.cells(id).open();
    }
};

ConsoleIO.View.Device.Status.prototype.addLabel = function addLabel(name) {
    var grid,
        id = this.id + "-" + name;

    if (!this.accordion.cells(id)) {
        this.accordion.addItem(id, name);
        this.grids[name] = grid = this.accordion.cells(id).attachGrid();

        grid.setIconsPath(ConsoleIO.Settings.iconPath);
        grid.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('grid'));
        grid.setHeader("Name,Value");
        grid.setInitWidthsP("20,80");
        grid.setColAlign("right,left");
        grid.setColTypes("ro,ro");
        grid.setColSorting("str,str");
        grid.setSkin(ConsoleIO.Constant.THEMES.get('win'));
        grid.init();
    }
};

ConsoleIO.View.Device.Status.prototype.add = function add(name, value, label) {
    var id, grid = this.grids[label];
    if (grid) {
        if (typeof value === 'object') {
            ConsoleIO.forEachProperty(value, function (val, itemName) {
                id = this.getUniqueId(this.id, name);
                grid.addRow(id, [name + ':' + itemName, val]);
                grid.setCellTextStyle(id, 0, "font-weight:bold;");
            }, this);
        } else {
            id = this.getUniqueId(this.id, name);
            grid.addRow(id, [name, value]);
            grid.setCellTextStyle(id, 0, "font-weight:bold;");
        }
    }
};

ConsoleIO.View.Device.Status.prototype.getValue = function getValue(id) {
    return this.toolbar.getValue(id);
};

ConsoleIO.View.Device.Status.prototype.setItemState = function setItemState(id, state) {
    if (this.toolbar) {
        this.toolbar.setItemState(id, state);
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Editor");

ConsoleIO.View.Editor = function EditorView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;

    this.container = null;
    this.textArea = null;
    this.target = null;
    this.toolbar = null;

    this.createElements();
};

ConsoleIO.View.Editor.prototype.render = function render(target) {
    this.target = target;
    this.target.attachObject(this.container);

    if (this.model.toolbar) {
        this.toolbar = this.target.attachToolbar();
        this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
        this.toolbar.attachEvent("onClick", function (itemId) {
            this.onButtonClick(itemId);
        }, this.ctrl);

        this.toolbar.attachEvent("onStateChange", function (itemId, state) {
            this.onButtonClick(itemId, state);
        }, this.ctrl);

        ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
    }
};

ConsoleIO.View.Editor.prototype.destroy = function destroy() {
    this.container.removeChild(this.textArea);
    this.container.parentNode.removeChild(this.container);
    if (this.toolbar) {
        this.toolbar.unload();
    }
};

ConsoleIO.View.Editor.prototype.listScripts = function listScripts(data) {
    var scope = this;
    this.toolbar.forEachListOption('open', function (id) {
        scope.toolbar.removeListOption('open', id);
    });

    ConsoleIO.forEach(data, function (file, index) {
        scope.toolbar.addListOption('open', 'script-' + file, index, 'button', file, ConsoleIO.Constant.ICONS.JAVASCRIPT);
    }, this);
};

ConsoleIO.View.Editor.prototype.addScript = function addScript(data) {
    var id = 'script-' + data.name,
        index = this.toolbar.getAllListOptions('open').length;

    this.toolbar.removeListOption('open', id);
    this.toolbar.addListOption('open', id, index, 'button', data.name, ConsoleIO.Constant.ICONS.JAVASCRIPT);
};

ConsoleIO.View.Editor.prototype.createElements = function createElements() {
    this.container = ConsoleIO.Service.DHTMLXHelper.createElement({
        attr: { 'class': 'editor' },
        target: document.body
    });

    this.textArea = ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: 'textarea',
        attr: { placeholder: this.model.placeholder },
        target: this.container
    });
};

ConsoleIO.View.Editor.prototype.toggleButton = function toggleButton(id, state) {
    if (this.toolbar) {
        if (state) {
            this.toolbar.enableItem(id);
        } else {
            this.toolbar.disableItem(id);
        }
    }
};

ConsoleIO.View.Editor.prototype.setItemText = function setItemText(id, text) {
    if (this.toolbar) {
        this.toolbar.setItemText(id, text);
    }
};


/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Manager");

ConsoleIO.View.Manager = function ManagerView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;

    this.target = null;
    this.tabs = null;
};

ConsoleIO.View.Manager.prototype.render = function render(target) {
    this.target = target;
    this.tabs = this.target.attachTabbar();
    this.tabs.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('tab'));
    this.tabs.enableTabCloseButton(true);

    this.tabs.attachEvent('onTabClose', function (id) {
        this.close(id);
    }, this.ctrl);

    this.tabs.attachEvent("onTabClick", function (tabId) {
        this.onTabClick(tabId);
    }, this.ctrl);
};

ConsoleIO.View.Manager.prototype.add = function add(id, name, isActive) {
    this.tabs.addTab(id, name);
    if (isActive) {
        this.tabs.setTabActive(id);
    }
};

ConsoleIO.View.Manager.prototype.update = function update(id, name) {
    this.tabs.setLabel(id, name);
};

ConsoleIO.View.Manager.prototype.remove = function remove(id) {
    this.tabs.removeTab(id);
};

ConsoleIO.View.Manager.prototype.getContextById = function getContextById(contextId) {
    return this.tabs ? this.tabs.cells(contextId) : null;
};

ConsoleIO.View.Manager.prototype.setActive = function setActive(id) {
    this.tabs.setTabActive(id);
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App");

ConsoleIO.App = function AppController() {
    this.context = {
        browser: "a",
        editor: "b",
        manager: "c"
    };

    this.view = new ConsoleIO.View.App(this, {
        target: document.body,
        type: "3U",
        status: "<a style='float:left;' target='_blank' href='http://nkashyap.github.io/console.io/'>Welcome to Console.IO</a><span style='float:right;'>Author: Nisheeth Kashyap, Email: nisheeth.k.kashyap@gmail.com</span>"
    });

    this.browser = new ConsoleIO.App.Browser(this, {
        title: 'Device List',
        contextId: 'browser',
        width: 200,
        height: 250,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh
        ]
    });

    this.editor = new ConsoleIO.App.Editor(this, {
        contextId: 'editor',
        title: 'Editor',
        placeholder: 'Write javascript code to execute on remote client',
        codeMirror: {
            mode: 'javascript',
            readOnly: false
        },
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Open,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Save,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Cut,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Copy,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Paste,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SelectAll,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Undo,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Redo,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Clear,
            ConsoleIO.Model.DHTMLX.ToolBarItem.WordWrap,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Execute
        ]
    });

    this.manager = new ConsoleIO.App.Manager(this, {
        title: 'Manager',
        contextId: 'manager'
    });

    ConsoleIO.Service.Socket.on('connect', this.onConnect, this);
    ConsoleIO.Service.Socket.on('disconnect', this.onDisconnect, this);
    ConsoleIO.Service.Socket.on('user:error', this.notify, this);
    ConsoleIO.Service.Socket.on('user:listScripts', this.listScripts, this);
    ConsoleIO.Service.Socket.on('user:scriptContent', this.add, this);
    ConsoleIO.Service.Socket.on('user:scriptSaved', this.scriptSaved, this);
};

ConsoleIO.App.prototype.render = function render() {
    this.view.render();
    this.browser.render(this.view.getContextById(this.context.browser));
    this.editor.render(this.view.getContextById(this.context.editor));
    this.manager.render(this.view.getContextById(this.context.manager));
};

ConsoleIO.App.prototype.setTitle = function setTitle(name, title) {
    this.view.setTitle(this.context[name], title);
};

ConsoleIO.App.prototype.listScripts = function listScripts(files) {
    this.editor.listScripts(files);
};

ConsoleIO.App.prototype.scriptSaved = function scriptSaved(file) {
    this.editor.fileName = file.name;
    this.editor.addScript(file);
};

ConsoleIO.App.prototype.add = function add(data) {
    this.editor.add(data);
};

ConsoleIO.App.prototype.onConnect = function onConnect() {
    this.view.online();
};

ConsoleIO.App.prototype.onDisconnect = function onDisconnect() {
    this.browser.clear();
    this.view.offline();
};

ConsoleIO.App.prototype.notify = function notify() {
    this.view.notify(ConsoleIO.toArray(arguments));
};

ConsoleIO.App.prototype.getActiveDeviceSerialNumber = function getActiveDeviceSerialNumber() {
    return this.manager.getActiveDeviceSerialNumber();
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device");

ConsoleIO.App.Device = function DeviceController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.activeTab = null;

    this.console = new ConsoleIO.App.Device.Console(this, this.model);
    this.source = new ConsoleIO.App.Device.Source(this, this.model);
    this.preview = new ConsoleIO.App.Device.Preview(this, this.model);
    this.status = new ConsoleIO.App.Device.Status(this, this.model);
    this.view = new ConsoleIO.View.Device(this, this.model);
};

ConsoleIO.App.Device.prototype.render = function render(target) {
    this.view.render(target);
    this.status.render(this.view.tabs);
    this.source.render(this.view.tabs);
    this.preview.render(this.view.tabs);
    this.console.render(this.view.tabs);
};

ConsoleIO.App.Device.prototype.destroy = function destroy() {
    this.console = this.console.destroy();
    this.source = this.source.destroy();
    this.preview = this.preview.destroy();
    this.status = this.status.destroy();
    this.view = this.view.destroy();
};

ConsoleIO.App.Device.prototype.update = function update(data) {
    this.parent.update(data);
};

ConsoleIO.App.Device.prototype.activate = function activate(state) {
    if (!state) {
        this.status.activate(state);
        this.source.activate(state);
        this.preview.activate(state);
        this.console.activate(state);
    } else if (this.activeTab) {
        this[this.activeTab].activate(state);
    }
};

ConsoleIO.App.Device.prototype.onTabClick = function onTabClick(tabId) {
    var newTab = (tabId.split('-')[0]).toLowerCase();

    if (this.activeTab && this.activeTab === newTab) {
        return;
    }

    if (this.activeTab) {
        this[this.activeTab].activate(false);
    }

    this.activeTab = newTab;
    this[this.activeTab].activate(true);
};

ConsoleIO.App.Device.prototype.onButtonClick = function onButtonClick(tab, btnId, state) {
    var handled = false;

    switch (btnId) {
        case 'reload':
            ConsoleIO.Service.Socket.emit('reloadDevice', {
                serialNumber: this.model.serialNumber
            });
            handled = true;
            break;

        //common on Status, Source and Preview Tabs
        case 'refresh':
            tab.refresh();
            handled = true;
            break;

        //common on Source and Preview Tabs
        case 'wordwrap':
            tab.editor.setOption('lineWrapping', state);
            handled = true;
            break;
        case 'selectAll':
            tab.editor.selectAll();
            handled = true;
            break;
        case 'copy':
            tab.editor.copy();
            handled = true;
            break;
    }

    return handled;
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Browser");

ConsoleIO.App.Browser = function BrowserController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.store = {
        platform: [],
        manufacture: [],
        browser: [],
        version: [],
        offline: [],
        subscribed: []
    };
    this.nodes = {
        processing: false,
        closed: []
    };

    this.view = new ConsoleIO.View.Browser(this, this.model);

    ConsoleIO.Service.Socket.on('user:registeredDevice', this.add, this);
    ConsoleIO.Service.Socket.on('user:subscribed', this.subscribed, this);
    ConsoleIO.Service.Socket.on('user:unSubscribed', this.unSubscribed, this);

    ConsoleIO.Service.Socket.on('device:registered', this.add, this);
    ConsoleIO.Service.Socket.on('device:online', this.online, this);
    ConsoleIO.Service.Socket.on('device:offline', this.offline, this);
};

ConsoleIO.App.Browser.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.serialNumber, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Browser.prototype.online = function online(data) {
    var index = this.store.offline.indexOf(data.serialNumber);
    if (index > -1) {
        this.store.offline.splice(index, 1);
    }

    if (this.isSubscribed(data.serialNumber)) {
        this.subscribed(data);
    } else {
        this.view.setIcon(data.serialNumber, ConsoleIO.Constant.ICONS.ONLINE);
    }
};

ConsoleIO.App.Browser.prototype.offline = function offline(data) {
    if (this.store.offline.indexOf(data.serialNumber) === -1) {
        this.store.offline.push(data.serialNumber);
    }
    this.view.setIcon(data.serialNumber, ConsoleIO.Constant.ICONS.OFFLINE);
};

ConsoleIO.App.Browser.prototype.isSubscribed = function isSubscribed(serialNumber) {
    return this.store.subscribed.indexOf(serialNumber) > -1;
};

ConsoleIO.App.Browser.prototype.subscribe = function subscribe(serialNumber) {
    if (!this.isSubscribed(serialNumber)) {
        ConsoleIO.Service.Socket.emit('subscribe', serialNumber);
    }
};

ConsoleIO.App.Browser.prototype.subscribed = function subscribed(data) {
    if (!this.isSubscribed(data.serialNumber)) {
        this.store.subscribed.push(data.serialNumber);
    }
    this.view.setIcon(data.serialNumber, ConsoleIO.Constant.ICONS.SUBSCRIBE);
};

ConsoleIO.App.Browser.prototype.unSubscribed = function unSubscribed(data) {
    var index = this.store.subscribed.indexOf(data.serialNumber);
    if (index > -1) {
        this.store.subscribed.splice(index, 1);
        if (this.store.offline.indexOf(data.serialNumber) === -1) {
            this.online(data);
        } else {
            this.offline(data);
        }
    }
};

ConsoleIO.App.Browser.prototype.add = function add(data) {
    var manufacture = data.platform + '-' + data.manufacture,
        browser = manufacture + '-' + data.browser,
        version = browser + '-' + data.version;

    if (this.store.platform.indexOf(data.platform) === -1) {
        this.store.platform.push(data.platform);
        this.view.add(data.platform, data.platform, 0, ConsoleIO.Constant.ICONS[data.platform.toUpperCase()] || ConsoleIO.Constant.ICONS.UNKNOWN);
    }

    if (this.store.manufacture.indexOf(manufacture) === -1) {
        this.store.manufacture.push(manufacture);
        this.view.add(manufacture, data.manufacture, data.platform, ConsoleIO.Constant.ICONS[data.manufacture.toUpperCase()] || ConsoleIO.Constant.ICONS.UNKNOWN);
    }

    if (this.store.browser.indexOf(browser) === -1) {
        this.store.browser.push(browser);
        this.view.add(browser, data.browser, manufacture, ConsoleIO.Constant.ICONS[data.browser.toUpperCase()] || ConsoleIO.Constant.ICONS.UNKNOWN);
    }

    if (this.store.version.indexOf(version) === -1) {
        this.store.version.push(version);
        this.view.add(version, data.version, browser, ConsoleIO.Constant.ICONS.VERSION);
    }

    this.view.addOrUpdate(data.serialNumber, data.name.indexOf('|') > -1 ? data.browser : data.name, version);

    this.nodes.processing = true;
    ConsoleIO.forEach([].concat(this.store.platform, this.store.manufacture, this.store.browser, this.store.version), function (id) {
        if (this.nodes.closed.indexOf(id) > -1) {
            this.view.closeItem(id);
        }
    }, this);

    ConsoleIO.async(function () {
        this.nodes.processing = false;
    }, this, 100);

    //set correct icon
    if (data.subscribed && data.online) {
        this.subscribed(data);
    } else if (data.online) {
        this.online(data);
    } else {
        this.offline(data);
    }
};

ConsoleIO.App.Browser.prototype.openNode = function openNode(itemId, state) {
    if (!this.nodes.processing) {
        var index = this.nodes.closed.indexOf(itemId);

        if (state === -1 && index === -1) {
            this.nodes.closed.push(itemId);
        } else if (index > -1) {
            this.nodes.closed.splice(index, 1);
        }
    }
};

ConsoleIO.App.Browser.prototype.clear = function clear() {
    ConsoleIO.forEach(this.store.platform, function (platform) {
        this.deleteItem(platform);
    }, this.view);

    this.store = {
        platform: [],
        manufacture: [],
        browser: [],
        version: [],
        offline: [],
        subscribed: []
    };
};

ConsoleIO.App.Browser.prototype.refresh = function refresh() {
    this.clear();
    ConsoleIO.Service.Socket.emit('refreshRegisteredDeviceList');
};

ConsoleIO.App.Browser.prototype.onButtonClick = function onButtonClick(btnId) {
    if (btnId === 'refresh') {
        this.refresh();
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Console");

ConsoleIO.App.Device.Console = function ConsoleController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.active = true;
    this.paused = false;
    this.filters = [];
    this.searchRegex = null;
    this.store = {
        added: [],
        queue: []
    };

    var config = this.model.web.config;

    if (typeof config.pageSize !== 'undefined') {
        ConsoleIO.Settings.pageSize.active = config.pageSize;
    }

    if (typeof config.paused !== 'undefined') {
        this.paused = this.model.web.config.paused;
    }

    if (typeof config.filters !== 'undefined') {
        this.filters = this.model.web.config.filters;
    }

    if (typeof config.search !== 'undefined') {
        this.searchRegex = this.model.web.config.search;
    }

    this.view = new ConsoleIO.View.Device.Console(this, {
        name: "Console",
        serialNumber: this.model.serialNumber,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.PlayPause,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Clear,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Export,
            ConsoleIO.Model.DHTMLX.ToolBarItem.PageSize,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SearchText,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Search,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.FilterLabel,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Info,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Log,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Warn,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Debug,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Error
        ]
    });

    ConsoleIO.Service.Socket.on('device:console:' + this.model.serialNumber, this.add, this);
};

ConsoleIO.App.Device.Console.prototype.render = function render(target) {
    this.view.render(target);
    this.view.setItemState('playPause', this.paused);
    this.view.setValue('searchText', this.searchRegex);

    if (this.searchRegex) {
        this.applySearch(this.searchRegex);
    }

    ConsoleIO.forEach(this.filters, function (filter) {
        this.view.setItemState('filter-' + filter, true);
    }, this);
};

ConsoleIO.App.Device.Console.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:console:' + this.model.serialNumber, this.add, this);
    this.view = this.view.destroy();
};

ConsoleIO.App.Device.Console.prototype.activate = function activate(state) {
    this.active = state;
    this.addBatch();
};

ConsoleIO.App.Device.Console.prototype.getData = function getData(store) {
    var count = 0, dataStore = [];
    if (store.length > 0) {
        ConsoleIO.every([].concat(store).reverse(), function (item) {
            if (this.isFiltered(item) && this.isSearchFiltered(item)) {
                dataStore.push(item);
                count++;
            }

            return ConsoleIO.Settings.pageSize.active > count;
        }, this);
    }

    return dataStore;
};

ConsoleIO.App.Device.Console.prototype.add = function add(data) {
    if (this.active && !this.paused) {
        this.store.added.push(data);

        if (!this.isFiltered(data) || !this.isSearchFiltered(data)) {
            return false;
        }

        this.view.add(data);
    } else {
        this.store.queue.push(data);
    }
};

ConsoleIO.App.Device.Console.prototype.addBatch = function addBatch() {
    if (this.active && !this.paused) {
        this.view.addBatch(this.getData(this.store.queue));
        this.store.added = this.store.added.concat(this.store.queue);
        this.store.queue = [];
    }
};

ConsoleIO.App.Device.Console.prototype.applySearch = function applySearch(value) {
    this.searchRegex = typeof value === 'undefined' ? this.view.getValue('searchText') : value;
    if (this.searchRegex) {
        if (this.searchRegex[0] !== "\\") {
            this.searchRegex = new RegExp("\\b" + this.searchRegex, "img");
        } else {
            this.searchRegex = new RegExp(this.searchRegex, "img");
        }
    }
    this.view.clear();
    this.view.addBatch(this.getData(this.store.added));
};

ConsoleIO.App.Device.Console.prototype.isSearchFiltered = function isSearchFiltered(data) {
    return this.searchRegex ? data.message.search(this.searchRegex) > -1 : true;
};

ConsoleIO.App.Device.Console.prototype.isFiltered = function isFiltered(data) {
    return this.filters.length === 0 || (this.filters.length > 0 && this.filters.indexOf(data.type) > -1);
};

ConsoleIO.App.Device.Console.prototype.onPageSizeChanged = function onPageSizeChanged(btnId) {
    ConsoleIO.Settings.pageSize.active = btnId.split("-")[1];
    this.view.clear();
    this.view.addBatch(this.getData(this.store.added));
};

ConsoleIO.App.Device.Console.prototype.onFilterChanged = function onFilterChanged(btnId, state) {
    var filter = btnId.split("-")[1],
        index = this.filters.indexOf(filter);

    if (state && index === -1) {
        this.filters.push(filter);
    } else if (index > -1) {
        this.filters.splice(index, 1);
    }

    this.view.clear();
    this.view.addBatch(this.getData(this.store.added));
};

ConsoleIO.App.Device.Console.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        if (btnId.indexOf('pagesize-') === 0) {
            this.onPageSizeChanged(btnId);
            this.notify();
        } else if (btnId.indexOf('filter-') === 0) {
            this.onFilterChanged(btnId, state);
            this.notify();
        } else {
            switch (btnId) {
                case 'playPause':
                    this.paused = state;
                    this.addBatch();
                    this.notify();
                    break;
                case 'clear':
                    this.view.clear();
                    this.notify(true);
                    break;
                case 'search':
                    this.applySearch();
                    this.notify();
                    break;
                case 'export':
                    ConsoleIO.Service.Socket.emit('exportHTML', {
                        serialNumber: this.model.serialNumber,
                        name: this.model.name,
                        content: this.view.getHTML()
                    });
                    break;
            }
        }
    }
};

ConsoleIO.App.Device.Console.prototype.notify = function notify(clearAll) {
    ConsoleIO.Service.Socket.emit('webControl', {
        serialNumber: this.model.serialNumber,
        pageSize: ConsoleIO.Settings.pageSize.active,
        filters: this.filters,
        search: this.view.getValue('searchText'),
        paused: this.paused,
        clear: !!clearAll
    });
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Explorer");

ConsoleIO.App.Device.Explorer = function ExplorerController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.store = {
        folder: [],
        files: []
    };
    this.nodes = {
        processing: false,
        opened: []
    };

    this.view = new ConsoleIO.View.Device.Explorer(this, this.model);
    ConsoleIO.Service.Socket.on('device:files:' + this.model.serialNumber, this.add, this);
};

ConsoleIO.App.Device.Explorer.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.serialNumber, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Device.Explorer.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:files:' + this.model.serialNumber, this.add, this);
    this.clear();
    this.view = this.view.destroy();
};

ConsoleIO.App.Device.Explorer.prototype.getParentId = function getParentId(list, item) {
    var index = list.indexOf(item);
    if (index > 0) {
        return (list.slice(0, index)).join('|');
    }
    return 0;
};

ConsoleIO.App.Device.Explorer.prototype.add = function add(data) {
    ConsoleIO.forEach(data.files, function (file) {
        file = file.split('?')[0];

        var regex = new RegExp("((http|https)://)?([^/]+)", 'img'),
            path = file.match(regex);

        ConsoleIO.forEach(path, function (name) {
            var isJSFile = name.indexOf('.js') > -1,
                isCSSFile = name.indexOf('.css') > -1,
                isHttpFile = name.indexOf('http') > -1,
                parentId = this.getParentId(path, name),
                id = parentId ? parentId + '|' + name : name;

            if (isJSFile || isCSSFile) {
                if (this.store.files.indexOf(id) === -1) {
                    this.store.files.push(id);
                    this.view.add(id, name, parentId, ConsoleIO.Constant.ICONS[isJSFile ? 'JAVASCRIPT' : isCSSFile ? 'STYLESHEET' : 'FILE']);
                }
            } else {
                if (this.store.folder.indexOf(id) === -1) {
                    this.store.folder.push(id);

                    this.view.add(id, name, parentId, ConsoleIO.Constant.ICONS[isHttpFile ? 'WEB' : 'FOLDEROPEN']);
                }
            }
        }, this);

    }, this);

    this.nodes.processing = true;
    ConsoleIO.forEach(this.store.folder, function (id) {
        if (this.nodes.opened.indexOf(id) === -1) {
            this.view.closeItem(id);
        }
    }, this);

    ConsoleIO.async(function () {
        this.nodes.processing = false;
    }, this, 100);
};

ConsoleIO.App.Device.Explorer.prototype.clear = function clear() {
    ConsoleIO.forEach(this.store.folder, function (folder) {
        this.deleteItem(folder);
    }, this.view);

    ConsoleIO.forEach(this.store.files, function (file) {
        this.deleteItem(file);
    }, this.view);

    this.store = {
        folder: [],
        files: []
    };
};

ConsoleIO.App.Device.Explorer.prototype.refresh = function refresh() {
    this.clear();

    ConsoleIO.Service.Socket.emit('reloadFiles', {
        serialNumber: this.model.serialNumber
    });
};

ConsoleIO.App.Device.Explorer.prototype.openNode = function openNode(itemId, state) {
    if (!this.nodes.processing) {
        var index = this.nodes.opened.indexOf(itemId);

        if (state === 1 && index === -1) {
            this.nodes.opened.push(itemId);
        } else if (index > -1) {
            this.nodes.opened.splice(index, 1);
        }
    }
};

ConsoleIO.App.Device.Explorer.prototype.viewFile = function viewFile(fileId) {
    ConsoleIO.Service.Socket.emit('fileSource', {
        serialNumber: this.model.serialNumber,
        url: (fileId.indexOf("http") === -1 ? '/' : '') + fileId.replace(/[|]/igm, "/")
    });
};

ConsoleIO.App.Device.Explorer.prototype.onButtonClick = function onButtonClick(btnId) {
    if (btnId === 'refresh') {
        this.refresh();
    }
};



/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Preview");

ConsoleIO.App.Device.Preview = function PreviewController(parent, model) {
    this.parent = parent;
    this.model = model;

    this.view = new ConsoleIO.View.Device.Preview(this, {
        name: "Preview",
        serialNumber: this.model.serialNumber,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.WordWrap,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SelectAll,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Copy,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Preview,
            ConsoleIO.Model.DHTMLX.ToolBarItem.ScreenShot
        ]
    });
    this.editor = new ConsoleIO.App.Editor(this, {});

    ConsoleIO.Service.Socket.on('device:content:' + this.model.serialNumber, this.add, this);
    ConsoleIO.Service.Socket.on('device:previewContent:' + this.model.serialNumber, this.preview, this);
    ConsoleIO.Service.Socket.on('device:screenShot:' + this.model.serialNumber, this.screenShot, this);
};

ConsoleIO.App.Device.Preview.prototype.render = function render(target) {
    this.view.render(target);
    this.editor.render(this.view.tab);
};

ConsoleIO.App.Device.Preview.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:content:' + this.model.serialNumber, this.add, this);
    ConsoleIO.Service.Socket.off('device:previewContent:' + this.model.serialNumber, this.preview, this);
    ConsoleIO.Service.Socket.off('device:screenShot:' + this.model.serialNumber, this.screenShot, this);
    this.editor = this.editor.destroy();
    this.view = this.view.destroy();
};

ConsoleIO.App.Device.Preview.prototype.activate = function activate(state) {
    if (state && ConsoleIO.Settings.reloadTabContentWhenActivated) {
        this.refresh();
    }
};

ConsoleIO.App.Device.Preview.prototype.add = function add(data) {
    this.editor.add(data);
};

ConsoleIO.App.Device.Preview.prototype.preview = function preview(data) {
    this.view.toggleButton('preview', true);
    this.view.preview(data);
};

ConsoleIO.App.Device.Preview.prototype.screenShot = function screenShot(data) {
    this.view.toggleButton('screenShot', true);
    this.view.screenShot(data);
};

ConsoleIO.App.Device.Preview.prototype.refresh = function refresh() {
    ConsoleIO.Service.Socket.emit('reloadHTML', {
        serialNumber: this.model.serialNumber
    });
};

ConsoleIO.App.Device.Preview.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        switch (btnId) {
            case 'preview':
                this.view.toggleButton('preview', false);
                ConsoleIO.Service.Socket.emit('previewHTML', {
                    serialNumber: this.model.serialNumber
                });
                break;
            case 'screenShot':
                this.view.toggleButton('screenShot', false);
                ConsoleIO.Service.Socket.emit('captureScreen', {
                    serialNumber: this.model.serialNumber
                });
                var scope = this;
                setTimeout(function () {
                    scope.view.toggleButton('screenShot', true);
                }, 10000);
                break;
        }
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Source");

ConsoleIO.App.Device.Source = function SourceController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.url = null;
    this.context = {
        explorer: "a",
        source: "b"
    };

    this.view = new ConsoleIO.View.Device.Source(this, {
        name: "Source",
        serialNumber: this.model.serialNumber,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.WordWrap,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SelectAll,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Copy
        ]
    });
    this.explorer = new ConsoleIO.App.Device.Explorer(this, {
        name: this.model.name,
        serialNumber: this.model.serialNumber,
        title: 'Files',
        contextId: 'explorer',
        width: 200,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh
        ]
    });
    this.editor = new ConsoleIO.App.Editor(this, {
        codeMirror: {
            mode: 'javascript'
        },
        title: 'Code',
        contextId: 'source'
    });

    ConsoleIO.Service.Socket.on('device:source:' + this.model.serialNumber, this.add, this);
};

ConsoleIO.App.Device.Source.prototype.render = function render(target) {
    this.view.render(target);
    this.explorer.render(this.view.getContextById(this.context.explorer));
    this.editor.render(this.view.getContextById(this.context.source));
};

ConsoleIO.App.Device.Source.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:source:' + this.model.serialNumber, this.add, this);
    this.explorer = this.explorer.destroy();
    this.editor = this.editor.destroy();
    this.view = this.view.destroy();
};

ConsoleIO.App.Device.Source.prototype.activate = function activate(state) {
    if (state && ConsoleIO.Settings.reloadTabContentWhenActivated) {
        this.refresh();
        this.explorer.refresh();
    }
};

ConsoleIO.App.Device.Source.prototype.setTitle = function setTitle(contextId, title) {
    this.view.setTitle(this.context[contextId], title);
};

ConsoleIO.App.Device.Source.prototype.add = function add(data) {
    this.url = data.url;
    this.editor.add(data);
    this.setTitle('source', this.url);
};

ConsoleIO.App.Device.Source.prototype.refresh = function refresh() {
    if (this.url) {
        ConsoleIO.Service.Socket.emit('fileSource', {
            serialNumber: this.model.serialNumber,
            url: this.url
        });
    }
};

ConsoleIO.App.Device.Source.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        console.log('onButtonClick', btnId);
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Status");

ConsoleIO.App.Device.Status = function StatusController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.activeTab = ConsoleIO.Settings.defaultActiveStatusAccordion;

    ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameText.value = this.model.name;
    this.view = new ConsoleIO.View.Device.Status(this, {
        name: "Status",
        serialNumber: this.model.serialNumber,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Web,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameLabel,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameText,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameSet
        ]
    });

    ConsoleIO.Service.Socket.on('device:status:' + this.model.serialNumber, this.add, this);
    ConsoleIO.Service.Socket.on('device:web:status:' + this.model.serialNumber, this.web, this);
};

ConsoleIO.App.Device.Status.prototype.render = function render(target) {
    this.view.render(target);
    this.view.setItemState('web', this.model.web.enabled);
};

ConsoleIO.App.Device.Status.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:status:' + this.model.serialNumber, this.add, this);
    ConsoleIO.Service.Socket.off('device:web:status:' + this.model.serialNumber, this.web, this);
    this.view = this.view.destroy();
};

ConsoleIO.App.Device.Status.prototype.web = function web(data) {
    this.model.web.enabled = data.enabled;
    this.view.setItemState('web', data.enabled);
};

ConsoleIO.App.Device.Status.prototype.activate = function activate(state) {
    if (state && ConsoleIO.Settings.reloadTabContentWhenActivated) {
        this.refresh();
    }
};

ConsoleIO.App.Device.Status.prototype.add = function add(data) {
    this.view.clear();

    ConsoleIO.forEach(data.info, function (item) {

        ConsoleIO.forEachProperty(item, function (value, property) {

            this.view.addLabel(property);

            ConsoleIO.forEachProperty(value, function (config, name) {
                switch (name.toLowerCase()) {
                    case 'search':
                    case 'href':
                        config = ConsoleIO.queryParams(config);
                        break;
                    case 'cookie':
                        config = ConsoleIO.cookieToJSON(config);
                        break;
                }

                this.view.add(name, typeof config === 'string' ? config.replace(/"/igm, "") : config, property);

            }, this);

        }, this);

    }, this);

    this.view.open(this.activeTab);
};

ConsoleIO.App.Device.Status.prototype.refresh = function refresh() {
    ConsoleIO.Service.Socket.emit('deviceStatus', {
        serialNumber: this.model.serialNumber
    });
};

ConsoleIO.App.Device.Status.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        switch (btnId) {
            case 'deviceNameSet':
                var name = this.view.getValue('deviceNameText');
                if (!!name) {
                    ConsoleIO.Service.Socket.emit('deviceName', {
                        serialNumber: this.model.serialNumber,
                        name: name
                    });
                    this.model.name = name;
                    this.parent.update(this.model);
                }
                break;
            case 'web':
                if (this.model.web.enabled !== state) {
                    this.model.web.enabled = state;
                    ConsoleIO.Service.Socket.emit('webConfig', {
                        serialNumber: this.model.serialNumber,
                        enabled: this.model.web.enabled
                    });
                }
                break;
        }
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Editor");
ConsoleIO.namespace("ConsoleIO.App.Editor.CopyDocument");

ConsoleIO.App.Editor = function EditorController(parent, model) {
    var scope = this;
    this.parent = parent;
    this.model = model;
    this.model.codeMirror = ConsoleIO.extend({
        mode: {
            name: "htmlmixed",
            scriptTypes: [
                {matches: /\/x-handlebars-template|\/x-mustache/i, mode: null},
                {matches: /(text|application)\/(x-)?vb(a|script)/i, mode: "vbscript"}
            ]
        },
        readOnly: true,
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        statementIndent: true,
        lineWrapping: false,
        styleActiveLine: true,
        highlightSelectionMatches: true,
        continueComments: "Enter",
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-Enter": "submit",
            "Ctrl-Q": "toggleComment",
            "Shift-Ctrl-Q": function (cm) {
                scope.foldCode(cm.getCursor());
            }
        },
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    }, this.model.codeMirror);
    this.fileName = null;
    this.fileCanBeSaved = false;

    this.view = new ConsoleIO.View.Editor(this, {
        serialNumber: this.model.serialNumber,
        placeholder: this.model.placeholder,
        toolbar: this.model.toolbar
    });
};

ConsoleIO.App.Editor.prototype.render = function render(target) {
    this.setTitle();
    this.editor = CodeMirror.fromTextArea(this.view.textArea, this.model.codeMirror);
    this.view.render(target);

    var scope = this;
    this.editor.on("change", function () {
        if (scope.fileName) {
            if (scope.fileCanBeSaved && !scope.getDoc().isClean()) {
                scope.setTitle(scope.fileName, 'UNSAVED');
            } else {
                scope.fileCanBeSaved = true;
                scope.setTitle(scope.fileName);
                scope.getDoc().markClean();
            }
        }

        scope.updateButtonState();
    });
};

ConsoleIO.App.Editor.prototype.destroy = function destroy() {
    this.view = this.view.destroy();
};

ConsoleIO.App.Editor.prototype.foldCode = function foldCode(where) {
    this.editor.foldCode(where, this.model.codeMirror.mode === 'javascript' ? CodeMirror.braceRangeFinder : CodeMirror.tagRangeFinder);
};

ConsoleIO.App.Editor.prototype.listScripts = function listScripts(data) {
    this.view.listScripts(data);
};

ConsoleIO.App.Editor.prototype.addScript = function addScript(data) {
    this.view.addScript(data);
    this.setTitle(this.fileName, 'SAVED');
    this.fileCanBeSaved = false;
};

ConsoleIO.App.Editor.prototype.getDoc = function getDoc() {
    return this.editor.getDoc();
};

ConsoleIO.App.Editor.prototype.setTitle = function setTitle() {
    if (this.parent.setTitle) {
        var title = [this.model.title].concat(ConsoleIO.toArray(arguments));
        this.parent.setTitle(this.model.contextId || this.model.serialNumber, title.join(' : '));
    }
};

ConsoleIO.App.Editor.prototype.add = function add(data) {
    if (data.name) {
        this.fileName = data.name;
        this.setTitle(this.fileName);
        this.view.setItemText(ConsoleIO.Model.DHTMLX.ToolBarItem.Clear.id, 'Close');
    }

    this.fileCanBeSaved = false;

    var content = data.content.replace(/%20/img, " "),
        lastLine;
    if (!data.start || data.start === 0) {
        this.editor.setValue(content);
    } else if (data.start > 0) {
        lastLine = this.editor.lastLine();
        this.editor.replaceRange(content, {
            line: lastLine,
            ch: this.editor.getLine(lastLine).length
        });
    }
};

ConsoleIO.App.Editor.prototype.setOption = function setOption(option, value) {
    this.editor.setOption(option, value);
};

ConsoleIO.App.Editor.prototype.selectAll = function selectAll() {
    var doc = this.getDoc();
    doc.setSelection({line: 0, ch: 0}, {line: doc.lineCount(), ch: 0});
};

ConsoleIO.App.Editor.prototype.copy = function copy() {
    ConsoleIO.App.Editor.CopyDocument = this.getDoc().getSelection();
    this.updateButtonState();
};

ConsoleIO.App.Editor.prototype.cut = function cut() {
    this.copy();
    this.editor.replaceSelection("");
    this.updateButtonState();
};

ConsoleIO.App.Editor.prototype.paste = function paste() {
    var doc = this.getDoc();
    if (ConsoleIO.App.Editor.CopyDocument) {
        if (doc.somethingSelected()) {
            doc.replaceSelection(ConsoleIO.App.Editor.CopyDocument);
        } else {
            this.editor.setValue(this.editor.getValue() + ConsoleIO.App.Editor.CopyDocument);
        }

        doc.setCursor({line: doc.lineCount(), ch: 0});
    }

    this.updateButtonState();
};

ConsoleIO.App.Editor.prototype.undo = function undo() {
    this.editor.undo();
    this.updateButtonState();
};

ConsoleIO.App.Editor.prototype.redo = function redo() {
    this.editor.redo();
    this.updateButtonState();
};

ConsoleIO.App.Editor.prototype.clear = function clear() {
    if (this.fileName && !this.getDoc().isClean()) {
        if (confirm("File is not saved!\nAre you sure you want to close it?")) {
            this.close();
        }
    } else {
        this.close();
    }
};

ConsoleIO.App.Editor.prototype.close = function close() {
    this.fileName = null;
    this.editor.setValue("");
    this.getDoc().markClean();
    this.getDoc().clearHistory();
    this.updateButtonState();
    this.setTitle();
    this.view.setItemText(ConsoleIO.Model.DHTMLX.ToolBarItem.Clear.id, ConsoleIO.Model.DHTMLX.ToolBarItem.Clear.text);
};

ConsoleIO.App.Editor.prototype.save = function save(saveAs) {
    var fileName = null,
        cmd = this.editor.getValue();

    if (this.fileName) {
        fileName = saveAs ? prompt("Save file as:", "") : this.fileName;
    } else {
        fileName = prompt("Enter a new file name:", "");
    }

    if (fileName !== null) {
        ConsoleIO.Service.Socket.emit('saveScript', {
            content: cmd,
            name: fileName
        });
    }
};

ConsoleIO.App.Editor.prototype.command = function command() {
    var cmd = this.editor.getValue();
    if (cmd) {
        ConsoleIO.Service.Socket.emit('execute', {
            serialNumber: this.parent.getActiveDeviceSerialNumber(),
            code: cmd
        });
    }
};

ConsoleIO.App.Editor.prototype.updateButtonState = function updateButtonState() {
    if (this.model.toolbar) {
        var history = this.getDoc().historySize();
        this.view.toggleButton('undo', (history.undo > 0));
        this.view.toggleButton('redo', (history.redo > 0));

        if (this.fileName) {
            this.view.toggleButton('save', (this.fileCanBeSaved && !this.getDoc().isClean()));
        } else {
            this.view.toggleButton('save', !this.getDoc().isClean());
        }
    }
};

ConsoleIO.App.Editor.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (btnId.indexOf('script-') === 0) {
        ConsoleIO.Service.Socket.emit('loadScript', {
            name: btnId.split("-")[1]
        });
        return;
    }

    switch (btnId) {
        case 'cut':
            this.cut();
            break;
        case 'copy':
            this.copy();
            break;
        case 'paste':
            this.paste();
            break;
        case 'selectAll':
            this.selectAll();
            break;
        case 'undo':
            this.undo();
            break;
        case 'redo':
            this.redo();
            break;
        case 'clear':
            this.clear();
            break;
        case 'wordwrap':
            this.setOption('lineWrapping', state);
            break;
        case 'execute':
            this.command();
            break;
        case 'save':
            this.save(false);
            break;
        case 'saveAs':
            this.save(true);
            break;
    }
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Manager");

ConsoleIO.App.Manager = function ManagerController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.activeTab = null;
    this.store = {
        serialNumber: [],
        device: []
    };
    this.exportFrame = null;
    this.view = new ConsoleIO.View.Manager(this, this.model);

    ConsoleIO.Service.Socket.on('user:subscribed', this.add, this);
    ConsoleIO.Service.Socket.on('user:unSubscribed', this.remove, this);
    ConsoleIO.Service.Socket.on('user:exportReady', this.exportReady, this);
};

ConsoleIO.App.Manager.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.serialNumber, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Manager.prototype.add = function add(data) {
    if (this.store.serialNumber.indexOf(data.serialNumber) === -1) {
        this.store.serialNumber.push(data.serialNumber);
        this.view.add(data.serialNumber, data.name, this.store.serialNumber.length > 0);

        var device = new ConsoleIO.App.Device(this, data);
        this.store.device.push(device);
        device.render(this.view.getContextById(data.serialNumber));
    }
};

ConsoleIO.App.Manager.prototype.update = function update(data) {
    if (this.store.serialNumber.indexOf(data.serialNumber) > -1) {
        this.view.update(data.serialNumber, data.name);
    }
};

ConsoleIO.App.Manager.prototype.remove = function remove(data) {
    var index = this.store.serialNumber.indexOf(data.serialNumber);
    if (index > -1) {
        ConsoleIO.every(this.store.device, function (device, index) {
            if (device.model.serialNumber === data.serialNumber) {
                device = device.destroy();
                this.store.device.splice(index, 1);
                return false;
            }

            return true;
        }, this);

        this.store.serialNumber.splice(index, 1);
        this.view.remove(data.serialNumber);

        if (this.activeTab === data.serialNumber) {
            this.activeTab = this.store.serialNumber[0];
            if (this.activeTab) {
                this.view.setActive(this.activeTab);
            }
        }

    }
};

ConsoleIO.App.Manager.prototype.exportReady = function exportReady(data) {
    if (!this.exportFrame) {
        this.exportFrame = ConsoleIO.Service.DHTMLXHelper.createElement({
            tag: 'iframe',
            target: document.body
        });
    }

    this.exportFrame.src = data.file;
};

ConsoleIO.App.Manager.prototype.close = function close(serialNumber) {
    ConsoleIO.Service.Socket.emit('unSubscribe', serialNumber);
};

ConsoleIO.App.Manager.prototype.onTabClick = function onTabClick(tabId) {
    if (this.activeTab && this.activeTab === tabId) {
        return;
    }

    var device;
    if (this.activeTab) {
        device = this.getDevice(this.activeTab);
        if (device) {
            device.activate(false);
        }
    }

    this.activeTab = tabId;
    device = this.getDevice(this.activeTab);
    if (device) {
        device.activate(true);
    }
};

ConsoleIO.App.Manager.prototype.getActiveDeviceSerialNumber = function getActiveDeviceSerialNumber() {
    return this.activeTab;
};

ConsoleIO.App.Manager.prototype.getDevice = function getDevice(serialNumber) {
    var device;

    ConsoleIO.every(this.store.device, function (item) {
        if (item.model.serialNumber === serialNumber) {
            device = item;
            return false;
        }

        return true;
    }, this);

    return device;
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.Settings");

ConsoleIO.Settings = {
    theme: 'web',
    iconPath: 'resources/icons/',
    reloadTabContentWhenActivated: true,
    pageSize: {
        active: 50,
        list: [50, 100, 250, 500]
    },
    defaultActiveStatusAccordion: 'device'
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.Constant.THEMES");
ConsoleIO.namespace("ConsoleIO.Constant.IMAGE_URL");
ConsoleIO.namespace("ConsoleIO.Constant.ICONS");

ConsoleIO.Constant.THEMES = {
    'web': {
        layout: 'dhx_skyblue',
        grid: 'dhx_skyblue',
        win: 'dhx_skyblue'
    },
    'terrace': {
        layout: 'dhx_terrace',
        grid: 'dhx_terrace',
        win: 'dhx_terrace'
    },
    get: function get(type) {
        return ConsoleIO.Constant.THEMES[ConsoleIO.Settings.theme][type];
    }
};

ConsoleIO.Constant.IMAGE_URL = {
    'web': {
        tree: "resources/lib/dhtmlx/web/imgs/csh_vista/",
        tab: "resources/lib/dhtmlx/web/imgs/",
        win: "resources/lib/dhtmlx/web/imgs/",
        grid: "resources/lib/dhtmlx/web/imgs/"
    },
    'terrace': {
        tree: "resources/lib/dhtmlx/terrace/imgs/csh_dhx_terrace/",
        tab: "resources/lib/dhtmlx/terrace/imgs/",
        win: "resources/lib/dhtmlx/terrace/imgs/",
        grid: "resources/lib/dhtmlx/terrace/imgs/"
    },
    get: function get(type) {
        return ConsoleIO.Constant.IMAGE_URL[ConsoleIO.Settings.theme][type];
    }
};

ConsoleIO.Constant.ICONS = {
    ONLINE: 'online.png',
    OFFLINE: 'offline.png',
    SUBSCRIBE: 'subscribe.gif',
    VERSION: 'version.gif',

    //Platform icons
    PC: 'pc.png',
    TV: 'tv.jpg',
    STB: 'stb.png',
    MOBILE: 'mobile.png',
    TABLET: 'tablet.png',
    MEDIA: 'media.png',
    BLUERAY: 'blueray.png',
    CONSOLE: 'playstation.png',

    //Manufacturers icons
    LG: 'lg.png',
    PHILIPS: 'philips.jpg',
    SAMSUNG: 'samsung.jpg',
    TOSHIBA: 'toshiba.png',
    TESCO: 'tesco.jpg',
    SONY: 'sony.jpg',
    PANASONIC: 'panasonic.gif',
    MICROSOFT: 'microsoft.png',
    MOZILLA: 'mozilla.png',
    GOOGLE: 'google.png',
    APPLE: 'apple.png',
    ANDROID: 'android.png',
    "OPERA SOFTWARE": 'opera.png',

    //Browser icons
    GINGERBREAD: 'gingerbread.jpg',
    CHROME: 'chrome.png',
    IE: 'explorer.png',
    FIREFOX: 'firefox.png',
    OPERA: 'opera.png',
    SAFARI: 'safari.png',
    MAPLE: 'maple.gif',
    NETTV: 'nettv.png',
    NETCAST: 'netcast.gif',
    TOSHIBATP: 'toshibatp.png',
    ESPIAL: 'espial.png',
    MSTAR: 'mstar.png',
    VIERA: 'viera.png',
    //"OREGAN MEDIA": '',
    PLAYSTATION: 'playstation.png',

    JAVASCRIPT: 'javascript.gif',
    STYLESHEET: 'stylesheet.gif',
    WEB: 'web.png',
    FILE: '',
    UNKNOWN: 'unknown.png',
    FOLDEROPEN: '../../' + ConsoleIO.Constant.IMAGE_URL.get('tree') + '/folderOpen.gif'
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

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
                    serialNumber: ConsoleIO.myApp.getActiveDeviceSerialNumber(),
                    code: cmd
                });
            }
        };

    }(CodeMirror, ConsoleIO));


    var i, cookie, key, value,
        cookies = document.cookie.split('; '),
        length = cookies.length;

    for (i = 0; i < length; i++) {
        cookie = cookies[i].split('=');
        key = cookie[0];
        value = cookie[1];
        ConsoleIO.Service.Storage.Store[key] = value;
    }

    ConsoleIO.styleSheet = (function styleSheet() {
        var element = document.createElement("style");
        element.type = 'text/css';
        element.id = 'console.io.style';

        // WebKit hack :(
        element.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.getElementsByTagName('head')[0].appendChild(element);

        return element.sheet || element.styleSheet;
    }());

    ConsoleIO.Service.Socket.connect();
    ConsoleIO.myApp = new ConsoleIO.App();
    ConsoleIO.myApp.render();
});
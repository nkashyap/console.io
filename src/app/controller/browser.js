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
    ConsoleIO.forEach([
    ].concat(this.store.platform, this.store.manufacture, this.store.browser, this.store.version), function (id) {
        if (this.nodes.closed.indexOf(id) > -1) {
            this.view.closeItem(id);
        }
    }, this);

    ConsoleIO.async(function () {
        this.nodes.processing = false;
    }, this);

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


ConsoleIO.App.Browser.prototype.isSubscribed = function isSubscribed(serialNumber) {
    return this.store.subscribed.indexOf(serialNumber) > -1;
};


ConsoleIO.App.Browser.prototype.onButtonClick = function onButtonClick(btnId) {
    if (btnId === 'refresh') {
        this.refresh();
    }
};
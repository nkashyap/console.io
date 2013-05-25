/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 18/05/13
 * Time: 20:43
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Browser");

ConsoleIO.App.Browser = function BrowserController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.store = {
        os: [],
        browser: [],
        offline: [],
        subscribed: []
    };

    this.view = new ConsoleIO.View.Browser(this, this.model);

    ConsoleIO.Service.Socket.on('user:registeredDevice', this.add, this);
    ConsoleIO.Service.Socket.on('user:subscribed', this.subscribed, this);
    ConsoleIO.Service.Socket.on('user:unSubscribed', this.unSubscribed, this);

    ConsoleIO.Service.Socket.on('device:registered', this.add, this);
    ConsoleIO.Service.Socket.on('device:online', this.online, this);
    ConsoleIO.Service.Socket.on('device:offline', this.offline, this);
};

ConsoleIO.App.Browser.prototype.online = function online(data) {
    var index = this.store.offline.indexOf(data.guid);
    if (index > -1) {
        this.store.offline.splice(index, 1);
    }

    if (this.isSubscribed(data.guid)) {
        this.subscribed(data);
    } else {
        this.view.setIcon(data.guid, ConsoleIO.Constraint.ICONS.ONLINE);
    }
};

ConsoleIO.App.Browser.prototype.offline = function offline(data) {
    if (this.store.offline.indexOf(data.guid) === -1) {
        this.store.offline.push(data.guid);
    }
    this.view.setIcon(data.guid, ConsoleIO.Constraint.ICONS.OFFLINE);
};

ConsoleIO.App.Browser.prototype.isSubscribed = function isSubscribed(guid) {
    return this.store.subscribed.indexOf(guid) > -1;
};

ConsoleIO.App.Browser.prototype.subscribed = function subscribed(data) {
    if (!this.isSubscribed(data.guid)) {
        this.store.subscribed.push(data.guid);
    }
    this.view.setIcon(data.guid, ConsoleIO.Constraint.ICONS.SUBSCRIBE);
};

ConsoleIO.App.Browser.prototype.unSubscribed = function unSubscribed(data) {
    var index = this.store.subscribed.indexOf(data.guid);
    if (index > -1) {
        this.store.subscribed.splice(index, 1);
        if (this.store.offline.indexOf(data.guid) === -1) {
            this.online(data);
        } else {
            this.offline(data);
        }
    }
};

ConsoleIO.App.Browser.prototype.add = function add(data) {
    var name = data.browser + '-' + data.version;

    if (this.store.os.indexOf(data.os) === -1) {
        this.view.add(data.os, data.os, 0, ConsoleIO.Constraint.ICONS[data.os.toUpperCase()]);
        this.store.os.push(data.os);
    }

    if (this.store.browser.indexOf(name) === -1) {
        this.view.add(data.browser, data.browser, data.os, ConsoleIO.Constraint.ICONS[data.browser.toUpperCase()]);
        this.view.add(name, data.version, data.browser, ConsoleIO.Constraint.ICONS.VERSION);
        this.store.browser.push(name);
    }

    this.view.add(data.guid, data.browser, name);

    //set correct icon
    if (data.subscribed) {
        this.subscribed(data);
    } else if (data.online) {
        this.online(data);
    } else {
        this.offline(data);
    }
};

ConsoleIO.App.Browser.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.guid, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Browser.prototype.refresh = function refresh() {
    ConsoleIO.forEach(this.store.os, function (os) {
        this.deleteItem(os);
    }, this.view);

    this.store = {
        os: [],
        browser: [],
        offline: [],
        subscribed: []
    };

    ConsoleIO.Service.Socket.emit('refreshRegisteredDeviceList');
};

ConsoleIO.App.Browser.prototype.buttonClick = function buttonClick(btnId) {
    if (btnId === 'refresh') {
        this.refresh();
    }
};

ConsoleIO.App.Browser.prototype.subscribe = function subscribe(guid) {
    if (!this.isSubscribed(guid)) {
        ConsoleIO.Service.Socket.emit('subscribe', guid);
    }
};

ConsoleIO.App.Browser.prototype.assignName = function assignName(guid, name) {
    console.log(guid, name);
//    ConsoleIO.Service.Socket.emit('assignDeviceName', {
//        guid: guid,
//        name: name
//    });
};

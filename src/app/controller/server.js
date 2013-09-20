/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 18/09/13
 * Time: 15:52
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Server");

ConsoleIO.App.Server = function ServerController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.view = new ConsoleIO.View.Server(this, this.model);
    this.isReady = false;
    ConsoleIO.Service.Socket.on('connect', this.onConnect, this);
    ConsoleIO.Service.Socket.on('connecting', this.onConnecting, this);
    ConsoleIO.Service.Socket.on('reconnect', this.onReconnect, this);
    ConsoleIO.Service.Socket.on('reconnecting', this.onReconnecting, this);
    ConsoleIO.Service.Socket.on('disconnect', this.onDisconnect, this);
    ConsoleIO.Service.Socket.on('connect_failed', this.onConnectFailed, this);
    ConsoleIO.Service.Socket.on('reconnect_failed', this.onReconnectFailed, this);
    ConsoleIO.Service.Socket.on('error', this.onError, this);

    ConsoleIO.Service.Socket.on('user:ready', this.onReady, this);
    ConsoleIO.Service.Socket.on('user:online', this.onOnline, this);
    ConsoleIO.Service.Socket.on('user:offline', this.onOffline, this);
    ConsoleIO.Service.Socket.on('user:disconnect', this.onUserDisconnect, this);
    ConsoleIO.Service.Socket.on('user:error', this.onUserError, this);
};


ConsoleIO.App.Server.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.serialNumber, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Server.prototype.update = function update(data) {
    if (!data.mode) {
        data.mode = ConsoleIO.Service.Socket.connectionMode;
    }

    this.view.update(data);
};


ConsoleIO.App.Server.prototype.onConnect = function onConnect() {
    this.update({
        status: 'Connected'
    });
};

ConsoleIO.App.Server.prototype.onConnecting = function onConnecting(mode) {
    this.update({
        status: 'Connecting',
        mode: mode
    });
};

ConsoleIO.App.Server.prototype.onReconnect = function onReconnect(mode, attempts) {
    this.update({
        status: 'Reconnected',
        mode: mode,
        attempts: attempts
    });
};

ConsoleIO.App.Server.prototype.onReconnecting = function onReconnecting(timeout, attempts) {
    this.update({
        status: 'Reconnecting',
        timeout: timeout,
        attempts: attempts
    });
};

ConsoleIO.App.Server.prototype.onDisconnect = function onDisconnect(reason) {
    this.update({
        status: 'Disconnected',
        reason: reason
    });
};

ConsoleIO.App.Server.prototype.onConnectFailed = function onConnectFailed() {
    this.update({
        status: 'Connection failed',
        args: ConsoleIO.toArray(arguments).join(', ')
    });
};

ConsoleIO.App.Server.prototype.onReconnectFailed = function onReconnectFailed() {
    this.update({
        status: 'Reconnection failed',
        args: ConsoleIO.toArray(arguments).join(', ')
    });
};

ConsoleIO.App.Server.prototype.onError = function onError(error) {
    this.update({
        status: 'Connection error',
        error: [error.type, error.message || ''].join(', ')
    });
};


ConsoleIO.App.Server.prototype.onReady = function onReady(data) {
    if (this.isReady) {
        this.parent.browser.clear();
        this.parent.manager.removeAll();
    }

    this.isReady = true;
    ConsoleIO.extend(ConsoleIO.Service.Socket, data);
    this.update({
        status: 'Ready'
    });
};

ConsoleIO.App.Server.prototype.onOnline = function onOnline(data) {
    this.isReady = true;
    ConsoleIO.extend(ConsoleIO.Service.Socket, data);
    this.update({
        status: 'Online'
    });
};

ConsoleIO.App.Server.prototype.onOffline = function onOffline(data) {
    ConsoleIO.extend(ConsoleIO.Service.Socket, data);
    this.update({
        status: 'Offline'
    });
};

ConsoleIO.App.Server.prototype.onUserDisconnect = function onUserDisconnect(data) {
    ConsoleIO.extend(ConsoleIO.Service.Socket, data);
    this.update({
        status: 'User disconnected'
    });
    ConsoleIO.Service.Socket.forceReconnect();
};

ConsoleIO.App.Server.prototype.onUserError = function onUserError(data) {
    this.update({
        status: 'Server error',
        message: data.message
    });
};


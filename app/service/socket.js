/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 18/05/13
 * Time: 20:44
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.Service.Socket");

ConsoleIO.Service.Socket = {
    io: null,
    name: null,
    guid: null,
    connectionMode: null,
    forceReconnection: true,
    forceReconnectInterval: 5000,
    setInterval: null,
    subscribed: false,

    connect: function init() {
        this.io = io.connect(window.location.origin, {
            secure: window.location.origin.indexOf("https") > -1,
            resource: (window.location.pathname.split('/').slice(0, -1).join('/') + '/socket.io').substring(1)
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
    },

    emit: function emit(name, data) {
        if (this.io && this.io.socket.connected) {
            data = data || {};
            this.io.emit('user:' + name, data);
        }
    },

    on: function on(name, callback, scope) {
        this.io.on(name, function () {
            callback.apply(scope || this, arguments);
        });
    },

    forceReconnect: function forceReconnect() {
        if (!this.forceReconnection || this.setInterval) {
            return false;
        }

        var scope = this;
        this.setInterval = window.setInterval(function () {
            if (!scope.io.socket.connected || (scope.io.socket.connected && !scope.subscribed)) {
                console.log('forceReconnect reconnecting', scope.name);
                scope.io.socket.disconnectSync();
                scope.io.socket.reconnect();
                window.clearInterval(scope.setInterval);
                scope.setInterval = null;
            }
        }, this.forceReconnectInterval);
    },

    onReady: function onReady(data) {
        var scope = ConsoleIO.Service.Socket;
        window.ConsoleIO.extend(scope, data);
        console.log('onReady', scope.name);
        scope.forceReconnect();
    },

    onOnline: function onOnline(data) {
        var scope = ConsoleIO.Service.Socket;
        window.ConsoleIO.extend(scope, data);
        console.log('Online', scope.name);
        scope.forceReconnect();
    },

    onOffline: function onOffline(data) {
        var scope = ConsoleIO.Service.Socket;
        window.ConsoleIO.extend(scope, data);
        console.log('Offline', scope.name);
        scope.forceReconnect();
    },

    onConnect: function onConnect() {
        var scope = ConsoleIO.Service.Socket;
        console.log('Connected to the Server');
        scope.emit('setUp');
        scope.subscribed = true;
        scope.forceReconnect();
    },

    onConnecting: function onConnecting(mode) {
        ConsoleIO.Service.Socket.connectionMode = mode;
        console.log('Connecting to the Server');
    },

    onReconnect: function onReconnect(mode, attempts) {
        var scope = ConsoleIO.Service.Socket;
        console.log('Reconnected to the Server after ' + attempts + ' attempts.');
        scope.connectionMode = mode;
        scope.forceReconnect();
    },

    onReconnecting: function onReconnecting() {
        console.log('Reconnecting to the Server');
    },

    onDisconnect: function onDisconnect() {
        console.log('Disconnected from the Server');
    },

    onConnectFailed: function onConnectFailed() {
        console.warn('Failed to connect to the Server');
    },

    onReconnectFailed: function onReconnectFailed() {
        console.warn('Failed to reconnect to the Server');
    },

    onError: function onError() {
        console.warn('Socket Error');
    }
};
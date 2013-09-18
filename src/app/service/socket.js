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
            this.io.emit('user:' + name, data || {});
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
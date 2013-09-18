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
        this.io.on('disconnect', this.onDisconnect);
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

    onConnect: function onConnect() {
        ConsoleIO.Service.Socket.emit('setUp');
    },

    onConnecting: function onConnecting(mode) {
        ConsoleIO.Service.Socket.connectionMode = mode;
    },

    onReconnect: function onReconnect(mode, attempts) {
        ConsoleIO.Service.Socket.connectionMode = mode;
    },

    onDisconnect: function onDisconnect(reason) {
        if (!reason || (reason && reason !== 'booted')) {
            ConsoleIO.Service.Socket.forceReconnect();
        }
    }
};
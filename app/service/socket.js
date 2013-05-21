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
    name: 'socket',
    connectionMode: null,

    connect: function init() {
        this.io = io.connect(window.location.origin, { secure: ConsoleIO.Settings.secure });

        // set events
        this.io.on('connect', this.onConnect);
        this.io.on('connecting', this.onConnecting);
        this.io.on('reconnect', this.onReconnect);
        this.io.on('reconnecting', this.onReconnecting);
        this.io.on('disconnect', this.onDisconnect);
        this.io.on('connect_failed', this.onConnectFailed);
        this.io.on('reconnect_failed', this.onReconnectFailed);
        this.io.on('error', this.onError);
    },

    emit: function emit(name, data) {
        if (this.io && this.io.socket.connected) {
            data = data || {};
            data.name = this.name;
            this.io.emit('user:' + name, data);
        } else {
            this.pending.push({ name: name, data: data });
        }
    },

    on: function on(name, callback, scope) {
        this.io.on(name, function () {
            callback.apply(scope, arguments);
        });
    },

    onConnect: function onConnect() {
        console.log('Connected to the Server');
        ConsoleIO.Service.Socket.emit('setUp');
    },

    onConnecting: function onConnecting(mode) {
        ConsoleIO.Service.Socket.connectionMode = mode;
        console.log('Connecting to the Server');
    },

    onReconnect: function onReconnect(mode, attempts) {
        ConsoleIO.Service.Socket.connectionMode = mode;
        console.log('Reconnected to the Server after ' + attempts + ' attempts.');
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
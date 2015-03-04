/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:13
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * transport
 */

(function (exports, global) {

    var transport = exports.transport = {},
        pending = [],
        lazyListener = [],
        config;

    function onMessage(event) {
        var data = event.data;
        transport.emit(data.event, {
            type: data.type,
            message: data.message,
            stack: data.stack,
            origin: event.origin
        });
    }

    function onConnect() {
        transport.emit('setUp', exports.client.getConfig());

        exports.console.log('Connected to the Server', arguments);
    }

    function onConnecting(mode) {
        transport.connectionMode = mode;
        transport.showInfoBar('connecting', false);

        exports.console.log('Connecting to the Server', mode);
    }

    function onReconnect(mode, attempts) {
        transport.connectionMode = mode;
        transport.emit('online', exports.client.getConfig());

        exports.console.log('Reconnected to the Server after ' + attempts + ' attempts.', mode, attempts);
    }

    function onReconnecting() {
        transport.showInfoBar('reconnecting', false);
        exports.console.log('Reconnecting to the Server', arguments);
    }

    function onDisconnect(reason) {
        transport.showInfoBar('disconnect', false);
        exports.console.log('Disconnected from the Server', reason);
        if (!reason || (reason && reason !== 'booted')) {
            transport.forceReconnect();
        }
    }

    function onConnectFailed() {
        transport.showInfoBar('connection failed', false);
        exports.console.warn('Failed to connect to the Server', arguments);
    }

    function onReconnectFailed() {
        transport.showInfoBar('reconnection failed', false);
        exports.console.warn('Failed to reconnect to the Server', arguments);
    }

    function onError(e) {
        transport.showInfoBar('connection error', false);
        exports.console.warn('Socket Error', e);
    }

    transport.connectionMode = '';
    transport.paused = false;

    transport.setUp = function setUp() {
        /** Fix for old Opera and Maple browsers
         * to process JSONP requests in a queue
         */
        (function overrideJsonPolling(io) {
            if (!io.Transport["jsonp-polling"]) {
                return;
            }

            var original = io.Transport["jsonp-polling"].prototype.post;

            io.Transport["jsonp-polling"].prototype.requestQueue = [];
            io.Transport["jsonp-polling"].prototype.isProcessingQueue = false;
            io.Transport["jsonp-polling"].prototype.hasOutstandingRequests = false;
            io.Transport["jsonp-polling"].prototype.postRequest = function postRequest() {
                var scope = this;
                this.isProcessingQueue = true;
                setTimeout(function () {
                    original.call(scope, scope.requestQueue.shift());
                }, 10);
            };
            io.Transport["jsonp-polling"].prototype.completePostRequest = function completePostRequest() {
                var scope = this;
                setTimeout(function () {
                    scope.socket.setBuffer(false);
                    scope.hasOutstandingRequests = scope.requestQueue.length > 0;
                    scope.isProcessingQueue = false;
                    scope.processPendingRequests();
                }, 250);
            };
            io.Transport["jsonp-polling"].prototype.processPendingRequests = function processPendingRequests() {
                if (this.hasOutstandingRequests && !this.isProcessingQueue) {
                    this.postRequest();
                    this.completePostRequest();
                }
            };
            io.Transport["jsonp-polling"].prototype.post = function (data) {
                this.requestQueue.push(data);
                this.hasOutstandingRequests = true;
                this.processPendingRequests();
            };

        }(global.io));

        config = exports.getConfig();
        transport.io = exports.io.connect(config.url, {
            secure: config.secure,
            resource: config.base + 'socket.io',
            'sync disconnect on unload': true
        });

        // set console.io event
        exports.console.on('console', function (data) {
            var msg = {
                type: data.type,
                message: escape(data.message),
                stack: data.stack
            };

            if (transport.paused) {
                pending.push({ name: 'console', data: msg });
            } else {
                transport.emit('console', msg);
            }
        });

        if (global.addEventListener) {
            global.addEventListener("message", onMessage, false);
        } else if (global.attachEvent) {
            global.attachEvent('onmessage', onMessage);
        }

        transport.io.on('connect', onConnect);
        transport.io.on('connecting', onConnecting);
        transport.io.on('reconnect', onReconnect);
        transport.io.on('reconnecting', onReconnecting);
        transport.io.on('disconnect', onDisconnect);
        transport.io.on('connect_failed', onConnectFailed);
        transport.io.on('reconnect_failed', onReconnectFailed);
        transport.io.on('error', onError);

        exports.util.forEach(lazyListener, function (item) {
            transport.on(item.name, item.callback, item.scope);
        });
        lazyListener = [];
    };

    transport.emit = function emit(name, data) {
        if (transport.isConnected()) {
            transport.io.emit('device:' + name, data || {});
            return true;
        } else {
            pending.push({ name: name, data: data });
            return false;
        }
    };

    transport.on = function on(name, callback, scope) {
        if (transport.io) {
            transport.io.on(name, function () {
                callback.apply(scope || this, arguments);
            });
        } else {
            lazyListener.push({ name: name, callback: callback, scope: scope });
        }
    };

    transport.isConnected = function isConnected() {
        return transport.io && transport.io.socket ? transport.io.socket.connected : false;
    };

    transport.forceReconnect = function forceReconnect() {
        try {
            transport.io.socket.disconnectSync();
            transport.io.socket.reconnect();
        } catch (e) {
            exports.console.error(e);
        }
    };

    transport.showInfoBar = function showInfoBar(msg, isOnline) {
        var cfg = exports.getConfig(), title = [];

        if (exports.name) title.push(exports.name);
        if (exports.serialNumber) title.push(exports.serialNumber);
        if (cfg.secure) title.push('secure');
        if (cfg.web) title.push('web');
        if (cfg.url) title.push(cfg.url);
        if (cfg.base) title.push(cfg.base);
        title.push(msg);
        title.push(isOnline ? 'online' : 'offline');
        if (transport.connectionMode) title.push(transport.connectionMode);
        exports.util.showInfo(title.join('|'), isOnline);
    };

    transport.clearPendingQueue = function clearPendingQueue() {
        var queue = [];

        exports.util.forEach(pending, function (item) {
            var state = transport.emit(item.name, item.data);
            if (!state) {
                queue.push(item);
            }
        });

        pending = queue;
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
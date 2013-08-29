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
        interval = null,
        pending = [],
        config;


    function onMessage(event) {
        var data = event.data;
        transport.emit(data.event, {
            type: data.type,
            message: data.message,
            stack: data.stack
        });
    }

    function onConnect() {
        var navigator = global.navigator;

        exports.console.log('Connected to the Server');

        transport.emit('setUp', {
            guid: exports.guid,
            deviceName: exports.name,
            userAgent: navigator.userAgent,
            appVersion: navigator.appVersion,
            vendor: navigator.vendor,
            platform: navigator.platform,
            opera: !!global.opera,
            params: exports.getConfig()
        });

        transport.forceReconnect();
    }

    function onConnecting(mode) {
        transport.connectionMode = mode;
        exports.console.log('Connecting to the Server');
    }

    function onReconnect(mode, attempts) {
        transport.connectionMode = mode;
        transport.subscribed = true;

        transport.clearPendingQueue();

        exports.console.log('Reconnected to the Server after ' + attempts + ' attempts.');

        transport.forceReconnect();
    }

    function onReconnecting() {
        exports.console.log('Reconnecting to the Server');
    }

    function onDisconnect() {
        exports.console.log('Disconnected from the Server');
    }

    function onConnectFailed() {
        exports.console.warn('Failed to connect to the Server');
    }

    function onReconnectFailed() {
        exports.console.warn('Failed to reconnect to the Server');
    }

    function onError() {
        exports.console.warn('Socket Error');
    }

    transport.connectionMode = '';
    transport.subscribed = false;

    transport.setUp = function setUp() {
        exports.guid = exports.storage.getItem('guid');
        exports.name = exports.storage.getItem('deviceName');

        /** Fix for old Opera and Maple browsers
         * to process JSONP requests in a queue
         */
        (function overrideJsonPolling(io) {
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
            resource: (config.base || '') + 'socket.io'
        });

        // set console.io event
        exports.console.on('console', function (data) {
            transport.emit('console', {
                type: data.type,
                message: escape(data.message),
                stack: data.stack
            });
        });

        if (global.addEventListener) {
            global.addEventListener("message", onMessage, false);
        } else if (global.attachEvent) {
            global.attachEvent('onmessage', onMessage);
        }

        // set events
        transport.io.on('connect', onConnect);
        transport.io.on('connecting', onConnecting);
        transport.io.on('reconnect', onReconnect);
        transport.io.on('reconnecting', onReconnecting);
        transport.io.on('disconnect', onDisconnect);
        transport.io.on('connect_failed', onConnectFailed);
        transport.io.on('reconnect_failed', onReconnectFailed);
        transport.io.on('error', onError);
    };

    transport.emit = function emit(name, data) {
        if (transport.isConnected()) {
            transport.io.emit('device:' + name, data);
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
        }
    };

    transport.isConnected = function isConnected() {
        return transport.io && transport.io.socket ? transport.io.socket.connected : false;
    };

    transport.forceReconnect = function forceReconnect() {
        if (!config.forceReconnection || interval) {
            return false;
        }

        interval = global.setInterval(function () {
            var connected = transport.isConnected();

            if (!connected || (connected && !transport.subscribed)) {

                exports.console.log('forceReconnect reconnecting', exports.name);

                try {
                    transport.io.socket.disconnectSync();
                    transport.io.socket.reconnect();
                } catch (e) {
                    exports.console.error(e);
                }

                global.clearInterval(interval);
                interval = null;
            }

        }, config.forceReconnectInterval);
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
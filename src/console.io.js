/**
 * Console.IO main init file
 *
 * User: nisheeth
 * Date: 26/08/13
 * Time: 09:51
 */

(function (exports, global) {

    exports.version = '0.0.15';
    exports.guid = '';
    exports.name = '';
    exports.config = {
        url: '',
        base: '/',
        html2canvas: "addons/html2canvas.js",
        socketio: "socket.io/socket.io.js",
        forceReconnection: true,
        forceReconnectInterval: 5000,
        nativeConsole: true,
        webOnly: false,

        docked: false,
        position: 'bottom',
        height: '300px',
        width: '99%'
    };

    exports.debug = function debug(msg) {
        var log = document.getElementById('log'), li;

        if (!log && document.body) {
            log = document.createElement('ul');
            log.setAttribute('id', 'log');
            document.body.insertBefore(log, document.body.firstElementChild || document.body.firstChild);
        }

        if (log) {
            li = document.createElement('li');
            li.innerHTML = msg;
            log.insertBefore(li, log.firstElementChild || log.firstChild);
        }
    };

    // Cover uncaught exceptions
    // Returning true will surpress the default browser handler,
    // returning false will let it run.
    var onErrorHandler = global.onerror;
    global.onerror = function onErrorFn(error, filePath, lineNo) {
        var result = false;
        if (onErrorHandler) {
            result = onErrorHandler(error, filePath, lineNo);
        }

        // Treat return value as window.onerror itself does,
        // Only do our handling if not suppressed.
        if (exports.transport.isConnected()) {
            exports.transport.emit('console', {
                type: 'error',
                message: error + ';\nfileName: ' + filePath + ';\nlineNo: ' + lineNo
            });
        } else if (exports.util.isIFrameChild()) {
            exports.console.exception(error + ';\nfileName: ' + filePath + ';\nlineNo: ' + lineNo);
        } else {
            exports.debug([error, filePath, lineNo].join("; "));
        }

        return result;
    };

    // Setup RequireJS global error handler
    if (exports.util.foundRequireJS()) {
        global.requirejs.onError = function (error) {
            exports.console.error(error, error.requireModules, error.originalError);
        };
    }


    /**
     * Maple browser fix
     * Maple has interface for both addEventListener and attachEvent
     * but attachEvent is not fully implemented so it never raise any event
     *
     * set it to undefined to force other libraries to use addEventListener instead
     */
    if (global.navigator.userAgent.search(/Maple/i) > -1) {
        /**
         * override samsung maple logging
         */
        global.alert = global.console.info;

        if (typeof HTMLElement.prototype.addEventListener === 'function' &&
            typeof HTMLElement.prototype.attachEvent === 'function') {
            HTMLElement.prototype.attachEvent = undefined;
        }
    }

    /** IE console fix */
    if (Function.prototype.bind && global.console && typeof global.console.log === "object") {
        exports.util.forEach(["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"],
            function (method) {
                global.console[method] = this.bind(global.console[method], global.console);
            },
            Function.prototype.call);
    }


    if (exports.util.isIFrameChild() && global.parent.postMessage) {
        exports.console.on('console', function (data) {
            global.parent.postMessage({
                event: 'console',
                type: data.type,
                message: escape(data.message),
                stack: data.stack
            }, "*");
        });
    }


    function configure(io) {
        exports.io = io || global.io;
        exports.transport.setUp();
        exports.client.setUp();
    }


    exports.util.ready(function () {
        exports.util.extend(exports.config, exports.util.getConfig());

        if (!exports.config.webOnly) {
            //Request console.io.js file to get connect.sid cookie from the server
            //Socket.io use connection cookie
            if (!exports.util.isIFrameChild()) {
                if (exports.util.foundRequireJS()) {
                    global.require(["socket.io"], configure);
                } else {
                    exports.util.require(exports.util.getUrl(exports.config) + exports.config.socketio, configure);
                }
            }
        }
    });

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
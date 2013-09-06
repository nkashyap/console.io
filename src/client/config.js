/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 26/08/13
 * Time: 09:51
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * Console.IO main init file
 */

(function (exports, global) {

    var defaultConfig = {
        url: '',
        base: '',
        secure: false,

        html2canvas: "plugins/html2canvas.js",
        //"console.io": "console.io.js",
        "socket.io": "socket.io/socket.io.js",
        webStyle: "console.css",
        proxy: 'proxy',

        forceReconnect: true,
        forceReconnectInterval: 5000,
        forceReconnectMaxTry: 10,

        nativeConsole: true,
        web: false,
        webOnly: false,

        consoleId: 'consoleioweb',
        docked: false,
        position: 'bottom',
        height: '300px',
        width: '99%'
    };

    function debug(msg) {
        var log = document.getElementById('log'), li;

        if (!log && document.body) {
            log = document.createElement('ul');
            log.setAttribute('id', 'log');
            document.body.insertBefore(log, exports.util.getFirstElement(document.body));
        }

        if (log) {
            li = document.createElement('li');
            li.innerHTML = msg;
            log.insertBefore(li, exports.util.getFirstElement(log));
        }
    }

    function getSettings() {
        var config = exports.config || exports.util.queryParams();

        config.webOnly = config.webOnly === true || (config.webOnly || '').toLowerCase() === 'true';
        config.web = config.web === true || (config.web || '').toLowerCase() === 'true';
        config.secure = config.secure === true || (config.secure || '').toLowerCase() === 'true';

        if (typeof config.filters !== 'undefined') {
            config.filters = typeof config.filters === 'string' ? config.filters.split(',') : config.filters;
        }

        return config;
    }

    function setUp(io) {
        exports.io = io || global.io;
        exports.transport.setUp();
        exports.client.setUp();

        if (defaultConfig.web) {
            exports.web.setUp();
        }
    }


    exports.guid = '';
    exports.name = '';

    exports.configure = function configure(cfg) {
        exports.util.extend(defaultConfig, cfg);

        if (!defaultConfig.webOnly) {
            //Request console.io.js file to get connect.sid cookie from the server
            //Socket.io use connection cookie
            if (!exports.util.isIFrameChild()) {
                if (exports.util.foundRequireJS()) {
                    global.require(["socket.io"], setUp);
                } else {
                    exports.util.require(exports.util.getUrl("socket.io"), setUp);
                }
            }
        } else {
            exports.web.setUp();
        }
    };

    exports.getConfig = function getConfig() {
        return defaultConfig;
    };

    exports.styleSheet = (function styleSheet() {
        var element = document.createElement("style");
        element.type = 'text/css';
        element.id = 'console.io.style';

        // WebKit hack :(
        element.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.head.appendChild(element);

        return element.sheet;
    }());

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
            debug([error, filePath, lineNo].join("; "));
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

    //Initialize console.io is RequireJS is not found
    if (!exports.util.foundRequireJS()) {
        exports.util.ready(function () {
            exports.configure(getSettings());
        });
    }

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
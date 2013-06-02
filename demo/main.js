/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 22/01/13
 * Time: 16:51
 * To change this template use File | Settings | File Templates.
 */
var domReady = false;

function init() {
    "use strict";

    if (domReady) {
        return;
    }

    domReady = true;

    var currentIndex = 0,
        Commands = [
            "console.log('log test');",
            "console.info('info test');",
            "console.warn('warn test');",
            "console.debug('debug test');",
            "console.assert(1 === 1, 'assert test');",
            "console.assert(1 !== 1, 'assert test');",
            "console.dir(document.getElementById('dummy'));",
            "console.dirxml(document.getElementById('dummy'));",
            "console.time('test');",
            "console.time('test-child');",
            "console.count('test');",
            "console.count('test-child');",
            "console.count('test-child');",
            "console.count('test');",
            "console.timeEnd('test-child');",
            "console.timeEnd('test');",
            "console.trace();",
            "console.error();"
        ],
        length = Commands.length;

    var isEventSet = false,
        connectionMode = document.getElementById('ConnectionMode');

    setInterval(function () {
        if (currentIndex < length) {
            eval(Commands[currentIndex++]);
            eval(Commands[currentIndex++]);
        } else {
            currentIndex = 0;
        }

        if (SocketIO) {
            var info = [
                "Name: " + SocketIO.name,
                "guid: " + SocketIO.guid,
                "mode: " + SocketIO.connectionMode,
                "connected: " + SocketIO.io.socket.connected,
                "subscribed: " + SocketIO.subscribed,
                "pending: " + SocketIO.pending.length,
                "forceReconnection: " + SocketIO.setInterval
            ].join(", ");

            connectionMode.innerHTML = info;
        }

        if (!isEventSet && ConsoleIO) {
            ConsoleIO.on('console', function (data) {
                window.InjectIO.debug(data.type + ': ' + data.message);
            });
            isEventSet = true;
        }
    }, 3000);
}

window.InjectIO.ready(init);
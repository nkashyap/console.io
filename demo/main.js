/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 22/01/13
 * Time: 16:51
 * To change this template use File | Settings | File Templates.
 */

function init() {
    "use strict";

    var currentIndex = 0,
        connectionMode = document.getElementById('ConnectionMode'),
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

    setInterval(function () {
        if (currentIndex < length) {
            eval(Commands[currentIndex++]);
        } else {
            currentIndex = 0;
        }

        if (window.ConsoleIO) {
            var info = [
                "Name: " + window.ConsoleIO.name,
                "guid: " + window.ConsoleIO.guid,
                "mode: " + window.ConsoleIO.transport.connectionMode,
                "connected: " + window.ConsoleIO.transport.isConnected(),
                "subscribed: " + window.ConsoleIO.transport.subscribed
            ].join(", ");

            connectionMode.innerHTML = info;
        }
    }, 2000);
}

if (typeof define === "function" && define.amd) {
    define(['console.io'], init);
} else {
    window.ConsoleIO.util.ready(init);
}


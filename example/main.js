/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 22/01/13
 * Time: 16:51
 * To change this template use File | Settings | File Templates.
 */

window.SERVER_PORT = 8082;

function init () {
    "use strict";
    window.Test = {
        duration: 2000,
        timeout: undefined,
        currentIndex: 0,
        commands: [
            "console.log('log test');",
            "console.info('info test');",
            "console.warn('warn test');",
            "console.debug('debug test');",
            "console.assert(1 === 1, 'assert test');",
            "console.assert(1 !== 1, 'assert test');",
            "console.dir(document.getElementById('welcome'));",
            "console.dirxml(document.getElementById('welcome'));",
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
        start: function () {
            var scope = this;
            var callback = function () {
                if (scope.currentIndex < scope.commands.length) {
                    eval(scope.commands[scope.currentIndex++]);
                } else {
                    scope.currentIndex = 0;
                }
            };
            scope.timeout = window.setInterval(callback, scope.duration);
        },
        stop: function () {
            var scope = this;
            window.clearInterval(scope.timeout);
            scope.timeout = undefined;
        }
    };
}

function requireScript (url, callback) {
    var node = document.createElement('script'),
        head = document.getElementsByTagName('head')[0];

    node.type = 'text/javascript';
    node.charset = 'utf-8';
    node.async = true;

    //IEMobile readyState "loaded" instead of "complete"
    if (!window.opera && (node.readyState === "complete" || node.readyState === "loaded")) {
        setTimeout(function () {
            callback(url);
        }, 1);
    }

    function onScriptLoad () {
        if (node.removeEventListener) {
            node.removeEventListener('load', onScriptLoad, false);
            callback(url);

        } else if (node.attachEvent) {
            //IEMobile readyState "loaded" instead of "complete"
            if (!window.opera && (node.readyState === "complete" || node.readyState === "loaded")) {
                node.detachEvent('onreadystatechange', onScriptLoad);
                callback(url);
            }
        }
    }

    function onScriptError () {
        node.removeEventListener('error', onScriptError, false);
    }

    if (node.addEventListener) {
        node.addEventListener('load', onScriptLoad, false);
        node.addEventListener('error', onScriptError, false);

    } else if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !global.opera) {
        // IE onload handler, this will also cause callback to be called twice
        node.onload = onScriptLoad;
        node.attachEvent('onreadystatechange', onScriptLoad);
    }

    node.src = url;
    head.appendChild(node);
}

if (typeof define === "function" && define.amd) {
    define(['console.io', 'console.io.config'], function (consoleio, config) {
        consoleio.configure(config);
        init();
    });
} else {

    var origin = location.origin || location.protocol + '//' + (location.host || location.hostname + ':' + location.port),
        url = location.protocol + '//' + location.hostname,
        pathname = location.pathname || location.href.replace(origin, '');

    //IIS NODE settings
    if (pathname.indexOf('console.io/') > -1) {
        url += ':' + location.port + '/console.io/';
    } else {
        url += ':' + window.SERVER_PORT + '/';
    }

    requireScript(url + 'console.io.js?web=true', function () {
        ConsoleIO.util.ready(init);
    });
}


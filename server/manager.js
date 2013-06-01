/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 17:06
 * To change this template use File | Settings | File Templates.
 */

function Manager() {

    var Device = require('./device'),
        User = require('./user'),
        express = require('express.io'),
        application = null,
        devices = {},
        users = {},
        manage;

    manage = {
        forEach: function forEach(list, callback) {
            Object.getOwnPropertyNames(list).forEach(function (name) {
                callback(list[name]);
            });
        },

        defineRouteHandler: function defineRouteHandler(list, name) {
            return function (request) {
                var reference = list[request.cookies.guid];
                if (reference && reference[name]) {
                    reference[name](request.data);
                }
            };
        },

        defineDeviceCommandRouteHandler: function defineDeviceCommandRouteHandler(property, name) {
            return function (request) {
                var device = devices[request.cookies.guid];
                if (device && device[property]) {
                    device[property](name, request.data);
                }
            };
        },

        defineUserCommandRouteHandler: function defineUserCommandRouteHandler(command, property) {
            return function (request) {
                var device = manage.getDeviceByGuid(request.data.guid);
                if (device) {
                    device.emit(command, property === true ? request.data : property ? request.data[property] : null);
                }
            };
        },

        registerDevice: function registerDevice(request) {
            var deviceReg = devices[request.cookies.guid];
            if (!deviceReg) {
                deviceReg = new Device(application, request, manage);
                devices[request.cookies.guid] = deviceReg;
                manage.emit('device:registered', deviceReg.getInformation());
            }
            deviceReg.online(request);
        },

        registerUser: function registerUser(request) {
            var userReg = users[request.cookies.guid];
            if (!userReg) {
                userReg = new User(application, request, manage);
                users[request.cookies.guid] = userReg;
            }

            userReg.online(request);
            manage.notifyRegisteredDevicesToUser(request);
        },

        disconnect: function disconnect(request) {
            var client = devices[request.cookies.guid] || users[request.cookies.guid];
            if (client) {
                client.offline();
            }
        },

        emit: function emit(name, data) {
            application.io.sockets.emit(name, data);
        },

        broadcast: function broadcast(room, name, data) {
            application.io.room(room).broadcast(name, data);
        },

        getDeviceByGuid: function getDeviceByGuid(guid) {
            var device;
            Object.getOwnPropertyNames(devices).every(function (name) {
                if (devices[name].guid == guid) {
                    device = devices[name];
                    return false;
                }
                return true;
            });

            return device;
        },

        notifyRegisteredDevicesToUser: function notifyRegisteredDevicesToUser(request) {
            var userReg = users[request.cookies.guid];
            if (userReg) {
                manage.forEach(devices, function (device) {
                    var deviceConfig = device.getInformation();
                    deviceConfig.subscribed = userReg.isSubscribed(deviceConfig.guid);
                    userReg.emit('registeredDevice', deviceConfig);
                });
            }
        }
    };

    function hasGUIDCookie(document) {
        if (document && document.cookie) {
            var i,
                cookieName,
                cookieValue,
                cookies = document.cookie.split(";");

            for (i = 0; i < cookies.length; i++) {
                cookieName = (cookies[i].substr(0, cookies[i].indexOf("="))).replace(/^\s+|\s+$/g, "");
                cookieValue = cookies[i].substr(cookies[i].indexOf("=") + 1);

                if (cookieName === 'guid') {
                    return unescape(cookieValue);
                }
            }
        }

        return null;
    }

    function setGUIDCookie(document) {
        var guidCookie, expiryDate = new Date();

        expiryDate.setDate(expiryDate.getDate() + 365);
        guidCookie = "guid=" + escape(((new Date().getTime()) + "-" + Math.random()).replace(".", "")) + "; expires=" + expiryDate.toUTCString() + "; path=/";

        if (document.setHeader) {
            document.setHeader("Set-Cookie", [guidCookie]);
        } else if (document.headers) {
            document.headers.cookie = guidCookie;
        }
    }

    function setUpCookieHandler() {
        var originalHandleRequest = express.io.Manager.prototype.handleRequest;
        express.io.Manager.prototype.handleRequest = function handleRequest(request, response) {
            if (!hasGUIDCookie(request.headers)) {
                setGUIDCookie(response);
            }
            originalHandleRequest.call(application.io, request, response);
        };
    }

    function setUp(app) {
        application = app;

        setUpCookieHandler();

        // IO handlers
        // Setup a route for the ready event, and add session data.
        app.io.route('disconnect', manage.disconnect);

        app.io.route('device', {
            setUp: manage.registerDevice,

            console: manage.defineDeviceCommandRouteHandler('command', 'console'),
            files: manage.defineDeviceCommandRouteHandler('command', 'files'),
            content: manage.defineDeviceCommandRouteHandler('command', 'content'),
            source: manage.defineDeviceCommandRouteHandler('command', 'source'),

            status: manage.defineRouteHandler(devices, 'status')
        });

        app.io.route('user', {
            setUp: manage.registerUser,
            refreshRegisteredDeviceList: manage.notifyRegisteredDevicesToUser,

            reloadDevice: manage.defineUserCommandRouteHandler('reload'),
            reloadFiles: manage.defineUserCommandRouteHandler('fileList'),
            reloadHTML: manage.defineUserCommandRouteHandler('htmlContent'),
            fileSource: manage.defineUserCommandRouteHandler('fileSource', true),
            deviceStatus: manage.defineUserCommandRouteHandler('status'),
            execute: manage.defineUserCommandRouteHandler('command', 'code'),

            saveScript: manage.defineRouteHandler(users, 'saveScript'),
            loadScript: manage.defineRouteHandler(users, 'loadScript'),
            exportHTML: manage.defineRouteHandler(users, 'exportHTML'),
            subscribe: manage.defineRouteHandler(users, 'subscribe'),
            unSubscribe: manage.defineRouteHandler(users, 'unSubscribe')
        });
    }


    return {
        setUp: setUp
    };
}

module.exports = Manager();
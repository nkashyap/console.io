/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 17:06
 * To change this template use File | Settings | File Templates.
 */

var Device = require('./device'),
    User = require('./user'),
    express = require('express.io');

function Manager() {

    var application = null,
        devices = {},
        users = {},
        self;

    self = {
        emit: function emit(name, data){
            application.io.sockets.emit(name, data);
        },
        broadcast: function broadcast(room, name, data){
            application.io.room(room).broadcast(name, data);
        },
        emitRegisteredDevices: function emitRegisteredDevices(user){
            if(user){
                forEach(devices, function(device){
                    var deviceConfig = device.getIdentity();
                    deviceConfig.subscribed = user.isSubscribed(deviceConfig.name);
                    user.emit('registeredDevice', deviceConfig);
                });
            }
        }
    };

    function defineRouteHandler(list, name) {
        return function (request) {
            var reference = list[request.cookies.guid];
            if (reference && reference[name]) {
                reference[name](request.data);
            }
        };
    }

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

    function forEach(list, callback){
        Object.getOwnPropertyNames(list).forEach(function(name){
            callback(list[name]);
        });
    }

    function setUp(app) {
        application = app;

        var originalHandleRequest = express.io.Manager.prototype.handleRequest;
        express.io.Manager.prototype.handleRequest = function handleRequest(request, response) {
            if(!hasGUIDCookie(request.headers)){
                setGUIDCookie(response);
            }
            originalHandleRequest.call(application.io, request, response);
        };

        // IO handlers
        // Setup a route for the ready event, and add session data.
        app.io.route('disconnect', disconnect);

        app.io.route('device', {
            setUp: function setUp(req) {
                register('device', req);
            },
            console: defineRouteHandler(devices, 'console')
        });

        app.io.route('user', {
            setUp: function setUp(req) {
                register('user', req);
            },
            getRegisteredDevices: function getRegisteredDevices(req){
                self.emitRegisteredDevices(users[req.cookies.guid]);
            },
            subscribe: defineRouteHandler(users, 'subscribe'),
            unSubscribe: defineRouteHandler(users, 'unSubscribe'),
            deviceFiles: defineRouteHandler(users, 'deviceFiles')
        });
    }

    function register(type, request) {
        if (type === 'device') {
            var deviceReg = devices[request.cookies.guid];
            if (!deviceReg) {
                deviceReg = new Device(application, request, self);
                devices[request.cookies.guid] = deviceReg;
                self.emit('device:registered', deviceReg.getIdentity());
            }
            deviceReg.online(request);
        }
        else if (type === 'user') {
            var userReg = users[request.cookies.guid];
            if (!userReg) {
                userReg = new User(application, request, self);
                users[request.cookies.guid] = userReg;
            }

            userReg.online(request);
            self.emitRegisteredDevices(userReg);
        }
    }

    function disconnect(request){
        var deviceReg = devices[request.cookies.guid];
        if (deviceReg) {
            deviceReg.offline();
            return;
        }

        var userReg = users[request.cookies.guid];
        if (userReg) {
            userReg.offline();
        }
    }

    return {
        setUp: setUp
    }
}

module.exports = Manager();
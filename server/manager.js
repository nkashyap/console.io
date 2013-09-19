/**
 * ConsoleIO connection manager server module
 *
 * @public
 * @name Manager
 * @function Manager
 * @requires module:device
 * @requires module:user
 * @returns {object} manager object
 *
 * @author Nisheeth Kashyap <nisheeth.k.kashyap@gmail.com>
 */
function Manager() {

    var Device = require('./device'),
        User = require('./user'),
        application = null,
        devices = {},
        users = {},
        manage = {};

    function forEach(list, callback) {
        Object.getOwnPropertyNames(list).forEach(function (name) {
            callback(list[name]);
        });
    }

    function extend(target, source) {
        target = target || {};

        Object.getOwnPropertyNames(source).forEach(function (name) {
            target[name] = source[name];
        });

        return target;
    }

    function emit(name, data) {
        application.io.sockets.emit(name, data);
    }

    function broadcast(room, name, data) {
        application.io.room(room).broadcast(name, data);
    }

    //COMMON
    function getSerialNumber(request) {
        var serialNumber = request.cookies.serialNumber,
            sid = request.cookies['connect.sid'];

        if (!serialNumber && request.data) {
            serialNumber = request.data.serialNumber;
        }

        if (!serialNumber) {
            forEach(devices, function (device) {
                if (device.sid === sid) {
                    serialNumber = device.serialNumber;
                }
            });
        }

        return serialNumber;
    }

    function getGUID(request) {
        var guid = request.cookies.guid,
            sid = request.cookies['connect.sid'];

        if (!guid && request.data) {
            guid = request.data.guid;
        }

        if (!guid) {
            forEach(users, function (user) {
                if (user.sid === sid) {
                    guid = user.serialNumber;
                }
            });
        }

        return guid;
    }

    function disconnect(request) {
        var clientDevice = getDeviceBySerialNumber(getSerialNumber(request));
        if (clientDevice) {
            clientDevice.offline();
            clientDevice.disconnect();
            console.log('disconnect client:', clientDevice.serialNumber);
            return;
        }

        var activeUser = users[getGUID(request)];
        if (activeUser) {
            activeUser.offline();
            activeUser.disconnect();
            console.log('disconnect user:', activeUser.guid);
            return;
        }

        console.log('disconnect - client not found', request);
    }

    function getDeviceBySerialNumber(serialNumber) {
        return devices[serialNumber];
    }

    // DEVICE
    function defineDeviceRouteHandler(name) {
        return function (request) {
            var clientDevice = getDeviceBySerialNumber(getSerialNumber(request));

            if (clientDevice && clientDevice[name]) {
                clientDevice[name](request.data);
            }
        };
    }

    function defineDeviceCommandRouteHandler(property, name) {
        return function (request) {
            var clientDevice = getDeviceBySerialNumber(getSerialNumber(request));

            if (clientDevice && clientDevice[property]) {
                clientDevice[property](name, request.data);
            }
        };
    }

    function registerDevice(request) {
        var serialNumber = getSerialNumber(request);

        // connecting for the first time
        if (!serialNumber) {
            Device.detect(request);
        } else {
            var clientDevice = devices[serialNumber];
            if (!clientDevice) {
                devices[serialNumber] = clientDevice = new Device(application, request, manage);
                emit('device:registered', clientDevice.getInfo());
            }

            clientDevice.online(request);
        }
    }

    // USERS
    function defineUserRouteHandler(name) {
        return function (request) {
            var activeUser = users[getGUID(request)];

            if (activeUser && activeUser[name]) {
                activeUser[name](request.data);
            }
        };
    }

    function defineDeviceMethodRouteHandler(property) {
        return function (request) {
            var device = getDeviceBySerialNumber(request.data.serialNumber);
            if (device && device[property]) {
                device[property](request.data);
            }
        };
    }

    function defineUserCommandRouteHandler(property, name) {
        return function (request) {
            var device = getDeviceBySerialNumber(request.data.serialNumber);

            if (device && device[property]) {
                device[property](name, request.data);
            }
        };
    }

    function defineUserCommandRouteEmitHandler(command, property) {
        return function (request) {
            var device = getDeviceBySerialNumber(request.data.serialNumber);
            if (device) {
                device.emit(command, property === true ? request.data : property ? request.data[property] : null);
            }
        };
    }

    function notifyRegisteredDevicesToUser(request) {
        var activeUser = users[getGUID(request)];

        if (activeUser) {
            forEach(devices, function (device) {
                var deviceInfo = device.getInfo();

                activeUser.emit('registeredDevice', extend(deviceInfo, {
                    subscribed: activeUser.isSubscribed(deviceInfo.serialNumber)
                }));
            });
        }
    }

    function changeDeviceName(request) {
        var device = getDeviceBySerialNumber(request.data.serialNumber);

        device.setName(request.data);

        emit('device:registered', device.getInfo());
    }

    function registerUser(request) {
        var guid = getGUID(request),
            activeUser = users[guid];
        if (!activeUser) {
            users[guid] = activeUser = new User(application, request, manage);
        }
        activeUser.online(request);
        notifyRegisteredDevicesToUser(request);
    }


    /** extend manage object with methods for child objects **/
    extend(manage, {
        forEach: forEach,
        extend: extend,
        emit: emit,
        broadcast: broadcast,
        getDeviceBySerialNumber: getDeviceBySerialNumber
    });


    /**
     * setUp express.io application routes and handlers
     *
     * @public
     * @function setUp
     * @param {object} app express.io application object
     */
    function setUp(app) {

        /** express.io app **/
        application = app;

        /**
         * disconnect event handler.
         * @callback manage~disconnect
         * @param {object} request express.io request object
         */
        app.io.route('disconnect', disconnect);

        /**
         * Device event routes handler.
         */
        app.io.route('device', {
            setUp: registerDevice,
            register: registerDevice,
            console: defineDeviceCommandRouteHandler('command', 'console'),
            files: defineDeviceCommandRouteHandler('command', 'files'),
            previewContent: defineDeviceCommandRouteHandler('command', 'previewContent'),
            screenShot: defineDeviceCommandRouteHandler('command', 'screenShot'),
            source: defineDeviceCommandRouteHandler('processSource', 'source'),
            content: defineDeviceCommandRouteHandler('processSource', 'content'),
            status: defineDeviceRouteHandler('status'),
            webStatus: defineDeviceRouteHandler('webStatus'),
            serialNumber: defineDeviceRouteHandler('setSerialNumber')
        });

        /**
         * User event routes handler.
         */
        app.io.route('user', {
            setUp: registerUser,
            refreshRegisteredDeviceList: notifyRegisteredDevicesToUser,
            deviceName: changeDeviceName,

            webConfig: defineUserCommandRouteEmitHandler('web:config', true),
            webControl: defineDeviceMethodRouteHandler('control'),

            fileSource: defineUserCommandRouteHandler('requestSource', 'fileSource'),
            reloadHTML: defineUserCommandRouteHandler('requestSource', 'htmlContent'),
            reloadDevice: defineUserCommandRouteEmitHandler('reload'),
            reloadFiles: defineUserCommandRouteEmitHandler('fileList'),
            previewHTML: defineUserCommandRouteEmitHandler('previewHTML'),
            captureScreen: defineUserCommandRouteEmitHandler('captureScreen'),
            deviceStatus: defineUserCommandRouteEmitHandler('status'),
            execute: defineUserCommandRouteEmitHandler('command', 'code'),

            beautify: defineUserRouteHandler('beautify'),
            writeFile: defineUserRouteHandler('writeFile'),
            readFile: defineUserRouteHandler('readFile'),

            exportLog: defineUserRouteHandler('exportLog'),
            subscribe: defineUserRouteHandler('subscribe'),
            unSubscribe: defineUserRouteHandler('unSubscribe')
        });
    }

    return {
        setUp: setUp
    };
}

/**
 * Export invoke Manager function and set it as a module
 * @module Manager
 */
module.exports = Manager();
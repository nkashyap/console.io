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
        if (request.cookies.serialNumber) {
            return request.cookies.serialNumber;
        }

        if (request.data) {
            return request.data.serialNumber;
        }
    }

    function getGUID(request) {
        if (request.cookies.guid) {
            return request.cookies.guid;
        }

        if (request.data) {
            return request.data.guid;
        }
    }

    function disconnect(request) {
        var clientDevice = getDeviceBySerialNumber(getSerialNumber(request));
        if (clientDevice) {
            clientDevice.disconnect();
            console.log('disconnect', clientDevice.serialNumber);
            return;
        }

        var activeUser = users[getGUID(request)];
        if (activeUser) {
            activeUser.disconnect();
            console.log('disconnect', activeUser.guid);
        }
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

    function defineUserCommandRouteHandler(command, property) {
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

            /**
             * Device registration handler
             */
            setUp: registerDevice,

            /**
             * Device registration handler
             */
            register: registerDevice,

            /**
             * Device console event routes handler.
             * gives client console logs
             */
            console: defineDeviceCommandRouteHandler('command', 'console'),

            /**
             * Device files event routes handler.
             * list all files attached in the client
             */
            files: defineDeviceCommandRouteHandler('command', 'files'),

            /**
             * Device content event routes handler.
             * gives HTML content of the page
             */
            content: defineDeviceCommandRouteHandler('command', 'content'),

            /**
             * Device content event routes handler.
             * gives Preview content of the page
             */
            previewContent: defineDeviceCommandRouteHandler('command', 'previewContent'),

            /**
             * Device content event routes handler.
             * sent Screen Shot of the page
             */
            screenShot: defineDeviceCommandRouteHandler('command', 'screenShot'),

            /**
             * Device source event routes handler.
             * gives source content of the file
             */
            source: defineDeviceCommandRouteHandler('command', 'source'),

            /**
             * Device status event routes handler.
             * gives device status information
             */
            status: defineDeviceRouteHandler('status'),

            /**
             * Device web console event routes handler.
             * add web console
             */
            webStatus: defineDeviceRouteHandler('webStatus'),

            /**
             * Device serial Number event routes handler.
             * sets device number
             */
            serialNumber: defineDeviceRouteHandler('setSerialNumber')
        });

        /**
         * User event routes handler.
         */
        app.io.route('user', {
            /**
             * User registration handler.
             */
            setUp: registerUser,

            /**
             * call server to emit list of all registered device.
             */
            refreshRegisteredDeviceList: notifyRegisteredDevicesToUser,

            /**
             * User command to set device name
             */
            deviceName: changeDeviceName,

            /**
             * User command to add/remove web console from client device
             */
            webConfig: defineUserCommandRouteHandler('web:config', true),

            /**
             * User command to control Web console on client device
             */
            webControl: defineDeviceMethodRouteHandler('control'),

            /**
             * User command to reload client device
             */
            reloadDevice: defineUserCommandRouteHandler('reload'),

            /**
             * User command to reload file list from device
             */
            reloadFiles: defineUserCommandRouteHandler('fileList'),

            /**
             * User command to get HTML content from client device
             */
            reloadHTML: defineUserCommandRouteHandler('htmlContent'),

            /**
             * User command to get HTML preview content from client device
             */
            previewHTML: defineUserCommandRouteHandler('previewHTML'),

            /**
             * User command to get screen shot of client device
             */
            captureScreen: defineUserCommandRouteHandler('captureScreen'),

            /**
             * User command to get file source from client device
             */
            fileSource: defineUserCommandRouteHandler('fileSource', true),

            /**
             * User command to get client device status
             */
            deviceStatus: defineUserCommandRouteHandler('status'),

            /**
             * command to execute on client side
             */
            execute: defineUserCommandRouteHandler('command', 'code'),

            /**
             * Save script route handler
             */
            saveScript: defineUserRouteHandler('saveScript'),

            /**
             * load script route handler
             */
            loadScript: defineUserRouteHandler('loadScript'),

            /**
             * Export logs route handler
             */
            exportHTML: defineUserRouteHandler('exportHTML'),

            /**
             * subscribe route handler
             */
            subscribe: defineUserRouteHandler('subscribe'),

            /**
             * unSubscribe route handler
             */
            unSubscribe: defineUserRouteHandler('unSubscribe')
        });
    }

    /**
     * Return static object with setUp method
     */
    return {
        setUp: setUp
    };
}

/**
 * Export invoke Manager function and set it as a module
 * @module Manager
 */
module.exports = Manager();
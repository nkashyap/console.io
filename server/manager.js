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
        //console.log('application.emit', name);
    }

    function broadcast(room, name, data) {
        application.io.room(room).broadcast(name, data);
        //console.log('application.broadcast', room, name);
    }

    function defineRouteHandler(list, name) {
        return function (request) {
            var reference = list[request.cookies.guid];
            if (reference && reference[name]) {
                reference[name](request.data);
            }

            //console.log('defineRouteHandler', reference.guid, name);
        };
    }

    function defineDeviceCommandRouteHandler(property, name) {
        return function (request) {
            var device = devices[request.cookies.guid];
            if (device && device[property]) {
                device[property](name, request.data);
            }
            //console.log('defineDeviceCommandRouteHandler', device ? device.guid : 'undefined', name, property);
        };
    }

    function defineUserCommandRouteHandler(command, property) {
        return function (request) {
            var device = getDeviceByGuid(request.data.guid);
            if (device) {
                device.emit(command, property === true ? request.data : property ? request.data[property] : null);
            }

            //console.log('defineUserCommandRouteHandler', device.guid, command);
        };
    }

    function notifyRegisteredDevicesToUser(request) {
        var userReg = users[request.cookies.guid];
        if (userReg) {
            forEach(devices, function (device) {
                var deviceConfig = device.getInformation();
                userReg.emit('registeredDevice', extend(deviceConfig, {
                    subscribed: userReg.isSubscribed(deviceConfig.guid)
                }));
            });
        }

        //console.log('notifyRegisteredDevicesToUser', userReg.guid);
    }

    function changeDeviceName(request) {
        var device = getDeviceByGuid(request.data.guid);
        device.setName(request.data);
        emit('device:registered', device.getInformation());

        //console.log('changeDeviceName', device.guid, device.name);
    }

    function registerDevice(request) {
        var deviceReg = devices[request.cookies.guid];
        if (!deviceReg) {
            deviceReg = new Device(application, request, manage);
            devices[request.cookies.guid] = deviceReg;
            emit('device:registered', deviceReg.getInformation());
        }

        deviceReg.online(request);

        //console.log('registerDevice', deviceReg.guid);
    }

    function registerUser(request) {
        var userReg = users[request.cookies.guid];
        if (!userReg) {
            userReg = new User(application, request, manage);
            users[request.cookies.guid] = userReg;
        }

        userReg.online(request);
        //console.log('registerUser', userReg.guid);

        notifyRegisteredDevicesToUser(request);
    }

    function disconnect(request) {
        var client = devices[request.cookies.guid] || users[request.cookies.guid];
        if (client) {
            client.offline();
        }

        console.log('disconnect', client ? client.guid : 'undefined');
    }

    function getDeviceByGuid(guid) {
        var device;
        Object.getOwnPropertyNames(devices).every(function (name) {
            //console.log('getDeviceByGuid', devices[name].guid, guid);
            if (devices[name].guid == guid) {
                device = devices[name];
                return false;
            }
            return true;
        });

        return device;
    }


    /** extend manage object with methods for child objects **/
    extend(manage, {
        forEach: forEach,
        extend: extend,
        defineRouteHandler: defineRouteHandler,
        defineDeviceCommandRouteHandler: defineDeviceCommandRouteHandler,
        defineUserCommandRouteHandler: defineUserCommandRouteHandler,
        changeDeviceName: changeDeviceName,
        registerDevice: registerDevice,
        registerUser: registerUser,
        disconnect: disconnect,
        emit: emit,
        broadcast: broadcast,
        getDeviceByGuid: getDeviceByGuid,
        notifyRegisteredDevicesToUser: notifyRegisteredDevicesToUser
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
            status: defineRouteHandler(devices, 'status'),

            /**
             * Device plugin event routes handler.
             * add plugins
             */
            plugin: defineRouteHandler(devices, 'plugin')
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
             * User command to add/remove plugin from client device
             */
            plugin: defineUserCommandRouteHandler('plugin', true),

            /**
             * User command to control WebIO console on client device
             */
            pluginControl: defineUserCommandRouteHandler('pluginControl', true),

            /**
             * User command to configure WebIO console on client device
             */
            pluginConfig: defineUserCommandRouteHandler('pluginConfig', true),

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
            saveScript: defineRouteHandler(users, 'saveScript'),

            /**
             * load script route handler
             */
            loadScript: defineRouteHandler(users, 'loadScript'),

            /**
             * Export logs route handler
             */
            exportHTML: defineRouteHandler(users, 'exportHTML'),

            /**
             * subscribe route handler
             */
            subscribe: defineRouteHandler(users, 'subscribe'),

            /**
             * unSubscribe route handler
             */
            unSubscribe: defineRouteHandler(users, 'unSubscribe')
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
/**
 * ConsoleIO server use module defined in this file
 * to create new device object when new device is connected to the server
 *
 * @author Nisheeth Kashyap <nisheeth.k.kashyap@gmail.com>
 */

/**
 * require detectDevice module
 */
var detectDevice = require('./detectdevice'),
    utils = require('./utils');


/**
 * Remote client Device class
 *
 * @public
 * @class Device
 * @constructor Device
 * @classdesc Remote client Device class
 * @requires module:detectDevice
 * @param {object} application express.io application object
 * @param {object} request express.io request object
 * @param {object} manager connection Manager object
 */
function Device(application, request, manager) {

    /** express.io app **/
    this.application = application;

    /** express.io request **/
    this.request = request;

    /** connection manager **/
    this.manager = manager;

    /**
     * Parse information provided by client to
     * detect device platform, manufacture, browser and version
     * @member {object} device
     */
    this.device = detectDevice.get(request.data);

    /**
     * Client specific script
     * @member {object} client
     */
    this.client = utils.getScript('./server/platforms', this.device, 'client.js');

    /**
     * Device serial Number
     * @member {object} client
     */
    this.serialNumber = this.request.cookies.serialNumber || this.request.data.serialNumber;
    this.sid = this.request.cookies['connect.sid'];

    /**
     * When user explicitly set device name, it is stored as a cookie on client device
     * It is used as a name if available on the cookie otherwise it generates the name
     * @member {string} name
     * @private
     */
    this.name = this.request.cookies.deviceName || Device.getName(this.device);

    /**
     * flag for online/offlice state of the device
     * @member {boolean} isOnline
     * @private
     * @defaultvalue
     */
    this.isOnline = false;

    /**
     * Store console log active configuration
     * @member {object} web
     */
    this.web = {
        config: {
            profile: this.request.data.params.profile
        }
    };


    /**
     * Various timestamps
     * @namespace
     * @property {Date} timeStamp.registered    - device registration time
     * @property {Date} timeStamp.connected     - device connected at
     * @property {Date} timeStamp.dataReceived  - last data received time
     * @private
     */
    this.timeStamp = {
        registered: (new Date()).toLocaleTimeString(),
        connected: null,
        dataReceived: null
    };

    /**
     * ready event.
     *
     * @event Device#ready
     * @type {object}
     * @property {string} name - device name
     * @property {string} serialNumber - device serialNumber
     */
    this.emit('ready', this.manager.extend(this.getInfo(), {
        client: this.client
    }));

    /**
     * Server log
     */
    if (!this.device.browser) {
        console.log("Unknown Browser", this.device, request.data);
    }
}


/**
 * Detect remote device
 *
 * @static
 * @requires module:detectDevice
 * @param {object} request express.io request object
 */
Device.detect = function detect(request) {

    /**
     * Parse information provided by client to
     * detect device platform, manufacture, browser and version
     * @member {object} device
     */
    var config = detectDevice.get(request.data);

    /**
     * registration event.
     *
     * @event Device#registration
     * @type {object}
     * @property {string} name - device name
     * @property {object} client - device script
     */
    request.io.emit('device:registration', {
        name: request.cookies.deviceName || Device.getName(config),
        client: utils.getScript('./server/platforms', config, 'client.js')
    });
};

/**
 * Device Name
 *
 * @static
 * @param {object} data detectDevice config
 */
Device.getName = function getName(data) {
    /** use array to build name **/
    var name = [data.browser || 'NoName'];

    /** add version if defined **/
    if (data.version) {
        name.push(data.version);
    }

    /** add platform if defined **/
    if (data.platform) {
        name.push(data.platform);
    }

    /** add manufacture if defined **/
    if (data.manufacture) {
        name.push(data.manufacture);
    }

    /** join and return as string **/
    return name.join("|");
};


/**
 * Get device information
 *
 * @public
 * @method getInfo
 * @returns {object} device information object
 */
Device.prototype.getInfo = function getInfo() {
    return {
        name: this.name,
        serialNumber: this.serialNumber,
        online: this.isOnline,
        web: this.web,
        browser: this.device.browser,
        platform: this.device.platform,
        manufacture: this.device.manufacture,
        version: this.device.version
    };
};

/**
 * Set device Name
 *
 * @public
 * @method setName
 * @param {object} data device property object data.name & data.serialNumber
 */
Device.prototype.setName = function setName(data) {

    /** set device name **/
    this.name = data.name;

    /**
     * name event.
     *
     * @event Device#name
     * @type {object}
     * @property {string} name - device name
     * @property {string} serialNumber - device serialNumber
     */
    this.emit('name', data);
};

Device.prototype.disconnect = function disconnect() {
    this.offline('device:disconnect');
};

/**
 * Set device status to online
 *
 * @public
 * @method online
 * @param {object} request express.io request object
 */
Device.prototype.online = function online(request) {
    /**
     * When browser in refreshed/reloaded then
     * express.io creates new request object of
     * the same client and assign connect.sid cookie
     * this method register new request for future communication
     */
    this.request = request;
    this.web.config.profile = this.request.data.params.profile;

    this.sid = this.request.cookies['connect.sid'];

    /** set online flag to true **/
    this.isOnline = true;

    /** join the room **/
    this.request.io.join(this.serialNumber);

    /** update connection time **/
    this.timeStamp.connected = (new Date()).toLocaleTimeString();

    /** get client script if in dev mode **/
    if (process.env.NODE_ENV === 'development') {
        this.client = utils.getScript('./server/platforms', this.device, 'client.js');
    }

    /**
     * device:online event is emitted at application level
     * and is received by all connected clients
     *
     * @event Device#device:online
     * @type {object}
     */
    var data = this.manager.extend(this.getInfo(), {
        client: this.client
    });
    this.manager.emit('device:online', data);
    this.broadcast('online:' + this.serialNumber, data);
};

/**
 * Set device status to offline
 *
 * @public
 * @method offline
 */
Device.prototype.offline = function offline(name) {

    /** set online flag to false **/
    this.isOnline = false;

    /** leave the room **/
    this.request.io.leave(this.serialNumber);

    /**
     * device:offline event is emitted at application level
     * and is received by all connected clients
     *
     * @event Device#device:offline
     * @type {object}
     */
    if (typeof name === 'string') {
        this.emit(name, this.getInfo());
    } else {
        var data = this.getInfo();
        this.manager.emit('device:offline', data);
        this.broadcast('offline:' + this.serialNumber, data);
    }
};

/**
 * broadcast commands sent from device
 *
 * @public
 * @method command
 * @param {string} name event name
 * @param {object} data response parameter object
 */
Device.prototype.command = function command(name, data) {

    /** update dataReceived timestamp **/
    this.timeStamp.dataReceived = (new Date()).toLocaleTimeString();

    /**
     * device:name event is broadcast in the room
     * and is received by all clients subscribed to the room
     *
     * @event Device#device:name
     * @type {object}
     */
    this.broadcast(name + ':' + this.serialNumber, data);
};

/**
 * broadcast device status event
 *
 * @public
 * @method status
 * @param {object} data response parameter object
 */
Device.prototype.status = function status(data) {

    var info = data.info,
        extendedInfo = [],
        deviceExtendInfo;

    /** extend response to add device information **/
    deviceExtendInfo = {
        device: {
            name: this.name
        }
    };

    extendedInfo.push(deviceExtendInfo);

    info.forEach(function (item) {
        /** add device name **/
        if (item.device) {
            this.manager.extend(deviceExtendInfo.device, item.device);
            return false;
        }

        /** extend connection information to include timestamps **/
        if (item.connection) {
            this.manager.extend(item.connection, {
                online: this.isOnline,
                registered: this.timeStamp.registered,
                connected: this.timeStamp.connected,
                dataReceived: this.timeStamp.dataReceived
            });
        }

        extendedInfo.push(item);
    }, this);

    data.info = extendedInfo;

    /**
     * device:name event is broadcast in the room
     * and is received by all clients subscribed to the room
     *
     * @event Device#device:status
     * @type {object}
     */
    this.broadcast('status:' + this.serialNumber, data);
};

/**
 * broadcast & store device web console status event
 *
 * @public
 * @method webStatus
 * @param {object} data response parameter object
 */
Device.prototype.webStatus = function webStatus(data) {
    this.web.enabled = data.enabled;
    this.broadcast('web:status:' + this.serialNumber, data);
};

/**
 * broadcast & store device web console control event
 *
 * @public
 * @method control
 * @param {object} data response parameter object
 */
Device.prototype.control = function control(data) {
    this.web.config = data;
    this.emit('web:control', data);
    this.web.config.clear = false;
};

Device.prototype.requestSource = function requestSource(name, data) {
    if (data.hasOwnProperty('beautify')) {
        this.web.config.beautify = data.beautify;
    }

    this.emit(name, data);
};

Device.prototype.processSource = function processSource(name, data) {
    /** update dataReceived timestamp **/
    this.timeStamp.dataReceived = (new Date()).toLocaleTimeString();

    if (this.web.config.beautify) {
        var type;
        if (data.url) {
            if (data.url.indexOf('.css') > -1) {
                type = 'css';
            } else if (data.url.indexOf('.js') > -1) {
                type = 'js';
            }
        }

        // data packets
        if (data.hasOwnProperty('start') && data.hasOwnProperty('length')) {
            this.content = (this.content || '') + data.content;

            if (data.start === 0) {
                this.maxLength = this.content.length;
            }

            if (this.content.length === data.length) {
                var start = 0,
                    content = utils.getContent(this.content, type),
                    length = content.length;

                // dispatch data in chunk to avoid core mirror locking up
                while (start < length) {
                    this.dispatchPacket(name, data, content.substr(start, this.maxLength), start, length);

                    if (start === 0) {
                        start = this.maxLength;
                    } else {
                        start += this.maxLength;
                    }
                }

                delete this.content;
                delete this.maxLength;
                return true;
            }
        } else {
            data.content = utils.getContent(data.content, type);
        }
    }

    this.broadcast(name + ':' + this.serialNumber, data);
};

Device.prototype.dispatchPacket = function dispatchPacket(name, params, content, start, length) {
    var fn = (function (scope, name, params, content, start, length) {
        return function () {
            var data = scope.manager.extend({}, params);
            data.content = content;
            data.start = start;
            data.length = length;
            scope.broadcast(name + ':' + scope.serialNumber, data);
        };
    }(this, name, params, content, start, length));

    setTimeout(fn, 100);
};

/**
 * emits events
 *
 * @public
 * @method emit
 * @param {string} name event name
 * @param {object} data response parameter object
 */
Device.prototype.emit = function emit(name, data) {
    this.request.io.emit('device:' + name, data);
};

/**
 * broadcast events are broadcast in the room
 * and is received by all clients subscribed to the room
 *
 * @public
 * @method broadcast
 * @param {string} name event name
 * @param {object} data response parameter object
 */
Device.prototype.broadcast = function broadcast(name, data) {
    this.request.io.room(this.serialNumber).broadcast('device:' + name, data);
};


/**
 * Export device class as module
 * @module Device
 * @class
 */
module.exports = Device;
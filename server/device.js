/**
 * ConsoleIO server use module defined in this file
 * to create new device object when new device is connected to the server
 *
 * @author Nisheeth Kashyap <nisheeth.k.kashyap@gmail.com>
 */

/**
 * require detectDevice module
 */
var detectDevice = require('./detectdevice');


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
function Device(application, request, manager, restored) {

    /** express.io app **/
    this.application = application;

    /** express.io request **/
    this.request = request;

    /** connection manager **/
    this.manager = manager;

    if (restored) {
        return;
    }

    /**
     * Parse information provided by client to
     * detect device platform, manufacture, browser and version
     * @member {object} device
     */
    this.device = detectDevice.get(request.data);

    /**
     * GLOBAL Unique identity of the connected client
     * Server set the guid cookie on the client if not available
     * and use it to create socket room for communications
     * @member {string} guid
     * @public
     */
    this.guid = application.getGUIDCookie(this.request);

    /**
     * When user explicitly set device name, it is stored as a cookie on client device
     * It is used as a name if available on the cookie otherwise it generates the name
     * @member {string} name
     * @private
     */
    this.name = this.request.cookies['deviceName'] || this.getName();

    /**
     * flag for online/offlice state of the device
     * @member {boolean} isOnline
     * @private
     * @defaultvalue
     */
    this.isOnline = false;

    /**
     * Plugins references
     * @member {object} plugins
     * @private
     * @defaultvalue
     */
    this.plugins = {};

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
     * @property {string} guid - device GUID
     */
    this.emit('ready', { name: this.name, guid: this.guid });

    /**
     * Server log
     */
    if (!this.device.browser) {
        console.log("Unknown Browser", this.device, request.data);
    }
}

Device.restore = function restore(application, request, manager, deviceConfig) {
    var parseDevice = new Device(application, request, manager, true);
    manager.extend(parseDevice, deviceConfig);
    return parseDevice;
};

Device.save = function save(device) {
    return {
        device: device.device,
        guid: device.guid,
        name: device.name,
        isOnline: device.isOnline,
        plugins: device.plugins,
        timeStamp: device.timeStamp
    };
};

/**
 * Get device information
 *
 * @public
 * @method getInformation
 * @returns {object} device information object
 */
Device.prototype.getInformation = function getInformation() {
    return {
        name: this.name,
        guid: this.guid,
        online: this.isOnline,
        plugins: this.plugins,
        browser: this.device.browser,
        platform: this.device.platform,
        manufacture: this.device.manufacture,
        version: this.device.version
    };
};

/**
 * Get device Name based on device information
 *
 * @public
 * @method getName
 * @returns {string} device name
 */
Device.prototype.getName = function getName() {
    /** use array to build name **/
    var name = [this.device.browser || 'NoName'];

    /** add version if defined **/
    if (this.device.version) {
        name.push(this.device.version);
    }

    /** add platform if defined **/
    if (this.device.platform) {
        name.push(this.device.platform);
    }

    /** add manufacture if defined **/
    if (this.device.manufacture) {
        name.push(this.device.manufacture);
    }

    /** join and return as string **/
    return name.join("|");
};

/**
 * Set device Name
 *
 * @public
 * @method setName
 * @param {object} data device property object data.name & data.guid
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
     * @property {string} guid - device GUID
     */
    this.emit('name', data);
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

    /** set online flag to true **/
    this.isOnline = true;

    /** join the room **/
    this.request.io.join(this.guid);

    /** update connection time **/
    this.timeStamp.connected = (new Date()).toLocaleTimeString();

    /**
     * device:online event is emitted at application level
     * and is received by all connected clients
     *
     * @event Device#device:online
     * @type {object}
     */
    this.manager.emit('device:online', this.getInformation());
};

/**
 * Set device status to offline
 *
 * @public
 * @method offline
 */
Device.prototype.offline = function offline() {

    /** set online flag to false **/
    this.isOnline = false;

    /** leave the room **/
    this.request.io.leave(this.guid);

    /**
     * device:offline event is emitted at application level
     * and is received by all connected clients
     *
     * @event Device#device:offline
     * @type {object}
     */
    this.manager.emit('device:offline', this.getInformation());
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
    this.broadcast(name + ':' + this.guid, data);
    console.log(name + ':' + this.guid, data.type);
};

/**
 * broadcast device status event
 *
 * @public
 * @method status
 * @param {object} data response parameter object
 */
Device.prototype.status = function status(data) {

    /** extend response to add device information **/
    data.device = {
        name: this.name,
        guid: this.guid
    };

    /** extend connection information to include timestamps **/
    this.manager.extend(data.connection, {
        online: this.isOnline,
        registered: this.timeStamp.registered,
        connected: this.timeStamp.connected,
        dataReceived: this.timeStamp.dataReceived
    });

    /**
     * device:name event is broadcast in the room
     * and is received by all clients subscribed to the room
     *
     * @event Device#device:status
     * @type {object}
     */
    this.broadcast('status:' + this.guid, data);
};

/**
 * broadcast device webIO event
 *
 * @public
 * @method plugin
 * @param {object} data response parameter object
 */
Device.prototype.plugin = function plugin(data) {

    /** add plugins **/
    if (!this.plugins[data.name]) {
        this.plugins[data.name] = { };
    }

    /** set plugin state **/
    this.plugins[data.name].enabled = data.enabled;

    /**
     * device:name event is broadcast in the room
     * and is received by all clients subscribed to the room
     *
     * @event Device#device:web
     * @type {object}
     */
    this.broadcast('plugin:' + this.guid, data);
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
    //console.log('device.emit', this.guid, name);
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
    this.request.io.room(this.guid).broadcast('device:' + name, data);
    //console.log('device.broadcast', this.guid, name);
};


/**
 * Export device class as module
 * @module Device
 * @class
 */
module.exports = Device;
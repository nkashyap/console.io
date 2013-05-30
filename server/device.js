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
     * GLOBAL Unique identity of the connected client
     * Server set the guid cookie on the client if not available
     * and use it to create socket room for communications
     * @member {string} guid
     * @public
     */
    this.guid = this.request.cookies.guid;

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
}

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
        browser: this.device.browser,
        platform: this.device.platform,
        manufacture: this.device.manufacture,
        version: this.device.version
    };
};

/**
 * Get device Name based on device information
 *
 * @private
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


Device.prototype.online = function online(request) {
    this.request = request;
    this.isOnline = true;
    this.request.io.join(this.guid);
    this.timeStamp.connected = (new Date()).toLocaleTimeString();
    this.manager.emit('device:online', this.getInformation());
};

Device.prototype.offline = function offline() {
    this.isOnline = false;
    this.request.io.leave(this.guid);
    this.manager.emit('device:offline', this.getInformation());
};

Device.prototype.console = function consoleLog(data) {
    this.timeStamp.dataReceived = (new Date()).toLocaleTimeString();
    this.broadcast('console:' + this.guid, data);
};

Device.prototype.files = function files(data) {
    this.broadcast('files:' + this.guid, data);
};

Device.prototype.content = function content(data) {
    this.broadcast('content:' + this.guid, data);
};

Device.prototype.source = function source(data) {
    this.broadcast('source:' + this.guid, data);
};

Device.prototype.status = function status(data) {
    data.connection.online = this.isOnline;
    data.connection.registered = this.timeStamp.registered;
    data.connection.connected = this.timeStamp.connected;
    data.connection.dataReceived = this.timeStamp.dataReceived;

    this.broadcast('status:' + this.guid, data);
};

Device.prototype.emit = function emit(name, data) {
    this.request.io.emit('device:' + name, data);
};

Device.prototype.broadcast = function broadcast(name, data) {
    this.request.io.room(this.guid).broadcast('device:' + name, data);
};


/**
 * Export device class as module
 * @module Device
 * @class
 */
module.exports = Device;
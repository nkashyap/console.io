/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 17:21
 * To change this template use File | Settings | File Templates.
 */

var detechDevice = require('./detectdevice');

function Device(application, request, manager) {
    this.application = application;
    this.request = request;
    this.manager = manager;
    this.info = detechDevice.get(request.data);
    this.guid = this.request.cookies.guid;
    this.name = this.request.cookies.deviceName || this.getName();
    this.isOnline = false;

    this.emit('ready', {
        name: this.name,
        guid: this.guid
    });
}

Device.prototype.getIdentity = function getIdentity() {
    return {
        name: this.name,
        guid: this.guid,
        online: this.isOnline,
        browser: this.info.name,
        os: this.info.os,
        version: this.info.version
    };
};

Device.prototype.getName = function getName() {
    var name = [this.info.name || 'Unknown'];
    if (this.info.version) {
        name.push(this.info.version);
    }
    if (this.info.os) {
        name.push(this.info.os);
    }

    return name.join("|");
};

Device.prototype.online = function online(request) {
    this.request = request;
    this.isOnline = true;
    this.request.io.join(this.guid);
    this.manager.emit('device:online', this.getIdentity());
};

Device.prototype.offline = function offline() {
    this.isOnline = false;
    this.request.io.leave(this.guid);
    this.manager.emit('device:offline', this.getIdentity());
};

Device.prototype.console = function consoleLog(data) {
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
    this.broadcast('status:' + this.guid, data);
};

Device.prototype.emit = function emit(name, data) {
    this.request.io.emit('device:' + name, data);
};

Device.prototype.broadcast = function broadcast(name, data) {
    this.request.io.room(this.guid).broadcast('device:' + name, data);
};


module.exports = Device;
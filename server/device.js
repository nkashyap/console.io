/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 17:21
 * To change this template use File | Settings | File Templates.
 */

var detechDevice = require('./detectdevice');

function Device(application, request, manager, number){
    this.application = application;
    this.request = request;
    this.manager = manager;
    this.info = detechDevice.get(request.data);
    this.number = this.request.cookies.guid || number;
    this.name = this.getName();
    this.isOnline = false;

    this.emit('ready', {
        name: this.name,
        number: this.number
    });

    this.online();
}

Device.prototype.getIdentity = function getIdentity(){
    return {
        name: this.name,
        number: this.number,
        browser: this.info.name,
        os: this.info.os,
        version: this.info.version
    };
};

Device.prototype.getName = function getName(){
    var name = [this.info.name || 'Unknown'];
    if (this.info.version) {
        name.push(this.info.version);
    }
    if (this.info.os) {
        name.push(this.info.os);
    }

    name.push(this.number);

    return name.join("|");
};

Device.prototype.online = function online(){
    this.isOnline = true;
    this.request.io.join(this.name);
    this.emit('online');
};

Device.prototype.offline = function offline(){
    this.isOnline = false;
    this.request.io.leave(this.name);
    this.emit('offline');
};

Device.prototype.log = function(data){
    this.broadcast('log', data);
};


Device.prototype.emit = function emit(name, data){
    this.request.io.emit('device:' + name, data);
};

Device.prototype.broadcast = function broadcast(name, data){
    this.request.io.room(this.name).broadcast('device:' + name, data);
};


module.exports = Device;
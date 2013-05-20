/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 17:21
 * To change this template use File | Settings | File Templates.
 */

function User(application, request, manager){
    this.application = application;
    this.request = request;
    this.manager = manager;
    this.devices = [];
    this.isOnline = false;

    this.emit('ready');
    this.online();
}

User.prototype.subscribe = function subscribe(data){
    if(this.devices.indexOf(data) === -1){
        this.devices.push(data);
        this.request.io.join(data);
        console.log('subscribe', data);
        this.emit('subscribed', data);
    }
};

User.prototype.unSubscribe = function unSubscribe(data){
    var index = this.devices.indexOf(data);
    if(index > -1){
        this.devices.splice(index, 1);
        this.request.io.leave(data);
        console.log('unSubscribe', data);
        this.emit('unSubscribe', data);
    }
};

User.prototype.online = function online(){
    this.isOnline = true;
    this.emit('online');
};

User.prototype.offline = function offline(){
    this.isOnline = false;
    this.emit('offline');
};

User.prototype.emit = function emit(name, data){
    this.request.io.emit('user:' + name, data);
};

User.prototype.broadcast = function broadcast(name, data){
    this.request.io.room(this.request.sessionID).broadcast('user:' + name, data);
};

module.exports = User;
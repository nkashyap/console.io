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

User.prototype.subscribe = function subscribe(name){
    if(this.devices.indexOf(name) === -1){
        this.devices.push(name);
        this.request.io.join(name);
        console.log('subscribe', name);
        this.emit('subscribed', { name: name });
    }
};

User.prototype.unSubscribe = function unSubscribe(name){
    var index = this.devices.indexOf(name);
    if(index > -1){
        this.devices.splice(index, 1);
        this.request.io.leave(name);
        console.log('unSubscribe', name);
        this.emit('unSubscribed', { name: name });
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
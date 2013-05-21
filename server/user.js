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
    this.number = this.request.cookies.guid;
    this.devices = [];
    this.isOnline = false;

    this.emit('ready');
}

User.prototype.isSubscribed = function isSubscribed(name){
    return this.devices.indexOf(name) > -1;
};

User.prototype.subscribe = function subscribe(name){
    if(!this.isSubscribed(name)){
        this.devices.push(name);
        this.request.io.join(name);
        this.emit('subscribed', { name: name });
        console.log('subscribe', name);
    }
};

User.prototype.unSubscribe = function unSubscribe(name){
    var index = this.devices.indexOf(name);
    if(index > -1){
        this.devices.splice(index, 1);
        this.request.io.leave(name);
        this.emit('unSubscribed', { name: name });
        console.log('unSubscribe', name);
    }
};

User.prototype.online = function online(request){
    this.request = request;
    this.isOnline = true;

    //subscribe again
    this.devices.forEach(function(name){
        this.request.io.join(name);
        this.emit('subscribed', { name: name });
    }, this);

    //this.manager.emit('user:online');
    //this.emit('online');
};

User.prototype.offline = function offline(){
    this.isOnline = false;

    //unsubscribe
    this.devices.forEach(function(name){
        this.request.io.leave(name);
    }, this);

    //this.emit('offline');
};

User.prototype.emit = function emit(name, data){
    this.request.io.emit('user:' + name, data);
};

User.prototype.broadcast = function broadcast(name, data){
    this.request.io.room(this.request.sessionID).broadcast('user:' + name, data);
};

module.exports = User;
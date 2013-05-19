/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 17:21
 * To change this template use File | Settings | File Templates.
 */

function User(application, request){
    this.application = application;
    this.request = request;
    this.devices = [];
    this.online = true;

    this.emit('ready');
}

User.prototype.offline = function offline(){
    this.online = false;
};

User.prototype.emit = function emit(name, data){
    this.request.io.emit(name, data);
};

User.prototype.broadcast = function broadcast(name, data){
    this.request.io.room(this.request.sessionID).broadcast(name, data);
};


module.exports = User;
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 17:21
 * To change this template use File | Settings | File Templates.
 */
var fs = require('fs');

function User(application, request, manager) {
    this.application = application;
    this.request = request;
    this.manager = manager;
    this.guid = this.request.cookies.guid;
    this.deviceGUIDs = [];
    this.isOnline = false;

    this.emit('ready', {
        name: this.guid,
        guid: this.guid
    });
}

User.prototype.isSubscribed = function isSubscribed(guid) {
    return this.deviceGUIDs.indexOf(guid) > -1;
};

User.prototype.subscribe = function subscribe(guid) {
    if (!this.isSubscribed(guid)) {
        this.deviceGUIDs.push(guid);
        this.request.io.join(guid);
        this.emit('subscribed', this.manager.getDeviceByGuid(guid).getIdentity());
        console.log('subscribe', guid);
    }
};

User.prototype.unSubscribe = function unSubscribe(guid) {
    var index = this.deviceGUIDs.indexOf(guid);
    if (index > -1) {
        this.deviceGUIDs.splice(index, 1);
        this.request.io.leave(guid);
        this.emit('unSubscribed', this.manager.getDeviceByGuid(guid).getIdentity());
        console.log('unSubscribe', guid);
    }
};

User.prototype.online = function online(request) {
    this.request = request;
    this.isOnline = true;

    //subscribe again
    this.deviceGUIDs.forEach(function (guid) {
        this.request.io.join(guid);
        this.emit('subscribed', this.manager.getDeviceByGuid(guid).getIdentity());
    }, this);

    this.listScripts();
};

User.prototype.offline = function offline() {
    this.isOnline = false;

    //unsubscribe
    this.deviceGUIDs.forEach(function (guid) {
        this.request.io.leave(guid);
    }, this);
};

User.prototype.exportHTML = function exportHTML(data) {
    var scope = this,
        cssFile = './app/resources/console.css',
        htmlFile = ["userdata/export/", data.name.replace(/[|]/ig, '-'), '-', data.guid, '-', (new Date()).getTime(), '.html'].join("");

    fs.readFile(cssFile, null, function (err, cssData) {
        if (err) {
            scope.emit('error', { message: 'Reading CSS file: ' + cssFile });

        } else {
            var content = ['<html><head><title>', data.name, '</title><style>', cssData, '</style></head><body>', data.content, '</body></html>'].join("");

            fs.writeFile("./" + htmlFile, content, function (err) {
                if (err) {
                    scope.emit('error', { message: 'Saving HTML file: ' + htmlFile });
                } else {
                    scope.emit('exportReady', { file: htmlFile });
                }
            });
        }
    });
};

User.prototype.listScripts = function listScripts() {
    var scope = this;
    fs.readdir('./userdata/scripts', function (err, files) {
        if (err) {
            scope.emit('error', { message: 'Reading Scripts: ./userdata/scripts' });
        } else {
            scope.emit('listScripts', files);
        }
    });
};

User.prototype.loadScript = function loadScript(data) {
    var scope = this,
        file = './userdata/scripts/' + data.name;

    fs.readFile(file, 'utf8', function (err, content) {
        if (err) {
            scope.emit('error', { message: 'Reading JS file: ' + file });
        } else {
            scope.emit('scriptContent', { name: data.name, content: content });
        }
    });
};

User.prototype.saveScript = function saveScript(data) {
    var scope = this,
        file = './userdata/scripts/' + (data.name.indexOf('.js') > 0 ? data.name : data.name + '.js');

    fs.writeFile(file, data.content, function (err) {
        if (err) {
            scope.emit('error', { message: 'Writing JS file: ' + file });
        } else {
            scope.emit('scriptSaved', { name: data.name });
        }
    });
};

User.prototype.emit = function emit(name, data) {
    this.request.io.emit('user:' + name, data);
};

User.prototype.broadcast = function broadcast(name, data) {
    this.request.io.room(this.guid).broadcast('user:' + name, data);
};

module.exports = User;
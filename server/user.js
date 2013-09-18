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

    this.guid = this.request.cookies.guid || this.request.data.guid;
    this.sid = this.request.cookies['connect.sid'];
    this.deviceSerialNumbers = [];
    this.isOnline = true;

    this.emit('ready', {
        name: this.guid,
        guid: this.guid,
        subscribed: this.isOnline
    });
}

User.prototype.isSubscribed = function isSubscribed(serialNumber) {
    return this.deviceSerialNumbers.indexOf(serialNumber) > -1;
};

User.prototype.subscribe = function subscribe(serialNumber) {
    var device = this.manager.getDeviceBySerialNumber(serialNumber);
    if (!this.isSubscribed(serialNumber)) {
        if (!device) {
            console.log('Device not found: ', serialNumber);
            return;
        }
        this.deviceSerialNumbers.push(serialNumber);
        this.request.io.join(serialNumber);
    }

    if (device) {
        this.emit('subscribed', device.getInfo());
        console.log('subscribe', serialNumber);
    }
};

User.prototype.unSubscribe = function unSubscribe(serialNumber) {
    var index = this.deviceSerialNumbers.indexOf(serialNumber);
    if (index > -1) {
        var device = this.manager.getDeviceBySerialNumber(serialNumber);
        if (!device) {
            console.log('Device not found: ', serialNumber);
            return;
        }
        this.deviceSerialNumbers.splice(index, 1);
        this.request.io.leave(serialNumber);
        this.emit('unSubscribed', device.getInfo());
        console.log('unSubscribe', serialNumber);
    }
};

User.prototype.disconnect = function disconnect() {
    this.offline('disconnect');
};

User.prototype.online = function online(request) {
    this.request = request;
    this.sid = this.request.cookies['connect.sid'];
    this.isOnline = true;

    this.deviceSerialNumbers.forEach(function (serialNumber) {
        var device = this.manager.getDeviceBySerialNumber(serialNumber).getInfo();
        if (device.online) {
            this.request.io.join(serialNumber);
            this.emit('subscribed', device);
        }
    }, this);

    this.emit('online', {
        name: this.guid,
        guid: this.guid,
        subscribed: this.isOnline
    });
    this.listScripts();
};

User.prototype.offline = function offline(name) {
    this.isOnline = false;

    this.deviceSerialNumbers.forEach(function (serialNumber) {
        this.request.io.leave(serialNumber);
    }, this);

    this.emit(typeof name === 'string' ? name : 'offline', {
        name: this.guid,
        guid: this.guid,
        subscribed: this.isOnline
    });
};

User.prototype.exportHTML = function exportHTML(data) {
    var scope = this,
        cssFile = './app/resources/console.css',
        htmlFile = [
            "userdata/export/", data.name.replace(/[|]/ig, '-'), '-', data.serialNumber, '-', (new Date()).getTime(),
            '.html'
        ].join("");

    fs.readFile(cssFile, null, function (err, cssData) {
        if (err) {
            scope.emit('error', {
                message: 'Error reading CSS file: ' + cssFile
            });

        } else {
            var content = [
                '<html><head><title>', data.name, '</title><style>', cssData, '</style></head><body>', data.content,
                '</body></html>'
            ].join("");

            fs.writeFile("./" + htmlFile, content, function (err) {
                if (err) {
                    scope.emit('error', {
                        message: 'Error saving HTML file: ' + htmlFile
                    });
                } else {
                    scope.emit('exportReady', {
                        file: htmlFile
                    });
                }
            });
        }
    });
};

User.prototype.listScripts = function listScripts() {
    var scope = this;
    fs.readdir('./userdata/scripts', function callback(err, files) {
        if (err) {
            scope.emit('error', {
                message: 'Error reading scripts: ./userdata/scripts'
            });
        } else {
            scope.emit('listScripts', files);
        }
    });
};

User.prototype.loadScript = function loadScript(data) {
    var scope = this,
        file = './userdata/scripts/' + (data.name.indexOf('.js') > 0 ? data.name : data.name + '.js');

    function callback(err, content) {
        if (err) {
            scope.emit('error', {
                message: 'Error reading JS file: ' + file
            });
        } else {
            scope.emit('scriptContent', {
                name: data.name,
                content: content
            });
        }
    }

    fs.readFile(file, 'utf8', callback);
};

User.prototype.saveScript = function saveScript(data) {
    var scope = this,
        file = './userdata/scripts/' + (data.name.indexOf('.js') > 0 ? data.name : data.name + '.js');

    function callback(err) {
        if (err) {
            scope.emit('error', {
                message: 'Error writing JS file: ' + file
            });
        } else {
            scope.emit('scriptSaved', {
                name: data.name
            });
        }
    }

    fs.writeFile(file, data.content, callback);
};

User.prototype.emit = function emit(name, data) {
    this.request.io.emit('user:' + name, data);
};

User.prototype.broadcast = function broadcast(name, data) {
    this.request.io.room(this.guid).broadcast('user:' + name, data);
};

module.exports = User;
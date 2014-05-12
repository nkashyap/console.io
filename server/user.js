/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 17:21
 * To change this template use File | Settings | File Templates.
 */
var utils = require('./utils');

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

    this.fileList();
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

User.prototype.exportLog = function exportLog(data) {
    var file = [
        "userdata/export/",
        data.name.replace(/[|]/ig, '-'),
        '-',
        data.serialNumber,
        '-',
        (new Date()).getTime(),
        '.html'
    ].join("");

    function error(e) {
        this.emit('error', {
            message: e.message
        });
    }

    utils.readFile(
        '/dist/client/',
        'console.css',
        function success(cssContent) {
            var content = [
                '<html><head><title>',
                data.name,
                '</title><style>',
                cssContent,
                '</style></head><body>',
                data.content,
                '</body></html>'
            ].join("");

            utils.writeFile(null, file, content, function success() {
                this.emit('download', {
                    file: file
                });
            }, error, this);
        },
        error,
        this);
};

User.prototype.beautify = function beautify(data) {
    data.content = utils.getContent(data.content, 'js');
    this.emit('contentBeautified', data);
};

User.prototype.fileList = function fileList() {
    utils.readdir(
        '/userdata/scripts/',
        function success(files) {
            this.emit('fileList', files);
        },
        function error(e) {
            this.emit('error', {
                message: e.message
            });
        },
        this);
};

User.prototype.readFile = function readFile(data) {
    if (data.name.indexOf('.js') === -1) {
        data.name += '.js';
    }

    utils.readFile(
        '/userdata/scripts/',
        data.name,
        function success(content) {
            this.emit('fileContent', {
                name: data.name,
                content: content
            });
        },
        function error(e) {
            this.emit('error', {
                message: e.message
            });
        },
        this);
};

User.prototype.writeFile = function writeFile(data) {
    if (data.name.indexOf('.js') === -1) {
        data.name += '.js';
    }

    utils.writeFile(
        '/userdata/scripts/',
        data.name,
        data.content,
        function success() {
            this.emit('fileSaved', {
                name: data.name
            });
        },
        function error(e) {
            this.emit('error', {
                message: e.message
            });
        },
        this);
};

User.prototype.emit = function emit(name, data) {
    this.request.io.emit('user:' + name, data);
};

User.prototype.broadcast = function broadcast(name, data) {
    this.request.io.room(this.guid).broadcast('user:' + name, data);
};

module.exports = User;
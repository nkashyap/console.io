/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 17:06
 * To change this template use File | Settings | File Templates.
 */

var Device = require('./device'),
    User = require('./user');

function Manager() {

    var application = null,
        devices = {},
        users = {},
        self;

    function defineRouteHandler(list, name) {
        return function (request) {
            var reference = list[request.sessionID];
            if (reference && reference[name]) {
                reference[name](request.data);
            }
        };
    }

    function setUp(app) {
        application = app;

        // IO handlers
        // Setup a route for the ready event, and add session data.
        app.io.route('disconnect', disconnect);

        app.io.route('device', {
            setUp: function setUp(req) {
                register('device', req);
            },
            log: defineRouteHandler(devices, 'log')
        });

        app.io.route('user', {
            setUp: function setUp(req) {
                register('user', req);
            },
            subscribe: defineRouteHandler(users, 'subscribe'),
            unSubscribe: defineRouteHandler(users, 'unSubscribe')
        });
    }

    self = {

    };



    function forEach(list, callback){
        Object.getOwnPropertyNames(list).forEach(function(name){
            callback(list[name]);
        });
    }

    function register(type, request) {
        if (type === 'device') {
            var deviceReg = devices[request.sessionID];
            if (!deviceReg) {
                deviceReg = new Device(application, request, self, Object.getOwnPropertyNames(devices).length + 1);
                devices[request.sessionID] = deviceReg;

                deviceReg.emit('registered', deviceReg.getIdentity());
//                forEach(users, function(user){
//                    user.emit('registered', deviceReg.getIdentity());
//                });
            }else{
                deviceReg.online();
            }
        }
        else if (type === 'user') {
            var userReg = users[request.sessionID];
            if (!userReg) {
                userReg = new User(application, request, self);
                users[request.sessionID] = userReg;

                forEach(devices, function(device){
                    userReg.emit('devices', device.getIdentity());
                });
            }else{
                userReg.online();
            }
        }
    }

    function disconnect(request){
        var deviceReg = devices[request.sessionID];
        if (deviceReg) {
            deviceReg.offline();
        }else {
            var userReg = users[request.sessionID];
            if (userReg) {
                userReg.offline();
            }
        }
    }

    return {
        setUp: setUp
    }
}

module.exports = Manager();
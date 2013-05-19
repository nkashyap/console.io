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
        devices = [],
        users = [];

    function setUp(app) {
        application = app;
    }

    function register(type, request) {
        if (type === 'device') {
            if (!getByRequest(devices, request)) {
                var registeredDevice = new Device(application, request, devices.length + 1);
                devices.push(registeredDevice);

                users.forEach(function(user){
                    user.emit('deviceRegistered', registeredDevice.getIdentity());
                });
            }
        }
        else if (type === 'user') {
            if (!getByRequest(users, request)) {
                var newUser = new User(application, request);
                users.push(newUser);

                devices.forEach(function(device){
                    newUser.emit('deviceRegistered', device.getIdentity());
                });
            }
        }

        //console.log('devices', devices.length, 'users', users.length, request.sessionID, request.cookies['connect.sid']);
    }

    function offline(request){
        var registeredDevice = getByRequest(devices, request);
        if (registeredDevice) {
            registeredDevice.offline();
        }else {
            var registeredUsers = getByRequest(users, request);
            if (registeredUsers) {
                registeredUsers.offline();
            }
        }
    }

    function log(request){
        var registeredDevice = getByRequest(devices, request);
        if (registeredDevice) {
            registeredDevice.log(request.data);
        }
    }

    function getByRequest(list, request) {
        var filteredItem = list.filter(function (item) {
            return request.sessionID === item.request.sessionID;
        });
        return filteredItem.length > 0 ? filteredItem[0] : null;
    }

    return {
        setUp: setUp,
        register: register,
        offline: offline,

        log: log
    }
}

module.exports = Manager();
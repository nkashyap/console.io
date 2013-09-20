/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 26/08/13
 * Time: 09:39
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * Storage
 */

(function (exports, global) {

    var storage = exports.storage = {},
        memoryStore = {};

    exports.util.ready(function () {
        var i, cookie, key, value,
            cookies = document.cookie.split('; '),
            length = cookies.length;

        for (i = 0; i < length; i++) {
            cookie = cookies[i].split('=');
            key = cookie[0];
            value = cookie[1];
            memoryStore[key] = value;
        }

        exports.util.forEachProperty(memoryStore, function (value, property) {
            if (property === 'serialNumber') {
                exports.serialNumber = value;
            }

            if (property === 'deviceName') {
                exports.name = value;
            }
        });
    });

    storage.addItem = function addItem(name, value, days) {
        if (!value || value === 'undefined') {
            return;
        }

        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }

        document.cookie = name + "=" + value + expires + "; path=/";
        memoryStore[name] = value;
    };

    storage.removeItem = function removeItem(name) {
        storage.addItem(name, '', -1);
        delete memoryStore[name];
    };

    storage.getItem = function getItem(name) {
        return memoryStore[name];
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
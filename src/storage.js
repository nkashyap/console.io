/**
 * Storage
 *
 * User: nisheeth
 * Date: 26/08/13
 * Time: 09:39
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

            if (global.localStorage) {
                if (!global.localStorage.getItem(key)) {
                    global.localStorage.setItem(key, value);
                }
            }
        }

        // override cookie with localstorage value
        if (global.localStorage) {
            var guid = global.localStorage.getItem('guid'),
                deviceName = global.localStorage.getItem('deviceName');

            if (guid && !memoryStore.guid) {
                storage.addItem('guid', guid, 365, true);
            }

            if (deviceName && !memoryStore.deviceName) {
                storage.addItem('deviceName', deviceName, 365, true);
            }
        }
    });

    storage.addItem = function addItem(name, value, days, skipLocalStorage) {
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

        if (!skipLocalStorage && global.localStorage) {
            global.localStorage.setItem(name, value);
        }
    };

    storage.removeItem = function removeItem(name) {
        storage.addItem(name, '', -1, true);
        delete memoryStore[name];

        if (global.localStorage) {
            global.localStorage.removeItem(name);
        }
    };

    storage.getItem = function getItem(name) {
        if (global.localStorage) {
            return global.localStorage.getItem(name) || memoryStore[name];
        }
        return memoryStore[name];
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
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

ConsoleIO.namespace("ConsoleIO.Service.Storage");

ConsoleIO.Service.Storage = {
    Store: {},

    addItem: function addItem(name, value, days) {
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
        ConsoleIO.Service.Storage.Store[name] = value;
    },

    removeItem: function removeItem(name) {
        this.addItem(name, '', -1);
        delete ConsoleIO.Service.Storage.Store[name];
    },

    getItem: function getItem(name) {
        return ConsoleIO.Service.Storage.Store[name];
    }
};
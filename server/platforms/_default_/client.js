/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 10/04/13
 * Time: 21:38
 * To change this template use File | Settings | File Templates.
 */

(function client() {
    return {
        configure: function configure(exports, global) {
            if (!exports.serialNumber) {
                exports.serialNumber = ((new Date().getTime()) + "-" + Math.random()).replace(".", "");
                exports.storage.addItem('serialNumber', exports.serialNumber, 365);
            }

            exports.transport.on('device:status', function () {
                exports.client.onStatus(exports, global);
            });

            exports.client.register();
        },

        onStatus: function onStatus(exports, global) {
            var info = [];

            info.push({ device: { serialNumber: exports.serialNumber }});
            info.push({ connection: { mode: exports.transport.connectionMode }});
            info.push({ document: { cookie: document.cookie }});
            info.push({ navigator: exports.client.jsonify(global.navigator) });
            info.push({ location: exports.client.jsonify(global.location) });
            info.push({ screen: exports.client.jsonify(global.screen) });

            exports.transport.emit('status', { info: info.concat(exports.client.getMore()) });
        }
    };
}());
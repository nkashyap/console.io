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
            exports.client.api = global.PanasonicDevice;

            if (!exports.serialNumber) {
                exports.serialNumber = exports.client.api.configuration.localSystem.networkInterfaces.item(0);
                exports.storage.addItem('serialNumber', exports.serialNumber, 365);
            }

            exports.transport.on('device:status', function () {
                exports.client.onStatus(exports, global);
            });

            exports.client.register();
        },

        onStatus: function onStatus(exports, global) {
            var info = [],
                network = exports.client.api.configuration.localSystem.networkInterfaces.item(0);

            info.push({ device: {
                apiVersion: exports.client.api
            }});

            info.push({ connection: {
                mode: exports.transport.connectionMode,
                macAddress: network.macAddress
            }});

            info.push({ document: { cookie: global.document.cookie }});
            info.push({ navigator: exports.client.jsonify(global.navigator) });
            info.push({ location: exports.client.jsonify(global.location) });
            info.push({ screen: exports.client.jsonify(global.screen) });

            exports.transport.emit('status', { info: info.concat(exports.client.getMore()) });
        }
    };
}());
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
            exports.client.api = global.BlinkBoxDevice;
            exports.transport.on('device:status', function () {
                exports.client.onStatus(exports, global);
            });
        },

        onStatus: function onStatus(exports, global) {
            var api = exports.client.api,
                info = [],
                device = {
                    manufacturer: api.getManufacturer(),
                    modelName: api.getModelName(),
                    serialNumber: api.getSerialNumber(),
                    version: api.getVersion(),
                    outputProtectionEnabled: api.getOutputProtectionEnabled()
                };

            info.push({ device: device });
            info.push({ connection: { mode: exports.transport.connectionMode }});
            info.push({ document: { cookie: document.cookie }});
            info.push({ navigator: exports.client.jsonify(global.navigator) });
            info.push({ location: exports.client.jsonify(global.location) });
            info.push({ screen: exports.client.jsonify(global.screen) });

            exports.transport.emit('status', { info: info });
        }
    };
}());
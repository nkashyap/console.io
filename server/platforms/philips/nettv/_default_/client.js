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
            exports.client.plugin = exports.client.getDevicePlugin(exports, 'application/drmagent');

            if (!exports.client.plugin) {
                exports.client.plugin = exports.client.addDevicePlugin({
                    type: 'application/drmagent',
                    id: 'device'
                });
            }

            exports.transport.on('device:status', function () {
                exports.client.onStatus(exports, global);
            });

            if (!exports.serialNumber) {
                exports.serialNumber = exports.client.plugin.DRMDeviceID;
                exports.storage.addItem('serialNumber', exports.serialNumber, 365);
            }

            exports.transport.emit('register');
        },

        addDevicePlugin: function addDevicePlugin(cfg) {
            var device = document.createElement('object');
            device.type = cfg.type;
            device.id = cfg.id;
            device.style.visibility = "hidden";
            document.body.appendChild(device);
            return device;
        },

        getDevicePlugin: function getDevicePlugin(exports, type) {
            var devicePlugin,
                domObjects = exports.util.toArray(document.getElementsByTagName('object'));

            if (domObjects.length > 0) {
                exports.util.every(domObjects, function (domObject) {
                    if (domObject.getAttribute('type') === type) {
                        devicePlugin = domObject;
                        return false;
                    }

                    return true;
                });
            }

            return devicePlugin;
        },

        onStatus: function onStatus(exports, global) {
            var info = [],
                device = {
                    serialNumber: exports.client.plugin.DRMDeviceID
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
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
            exports.client.api = global.toshibaPlaces.systemInfo;
            exports.client.CONST = {
                NETWORK: {
                    '0': 'LAN',
                    '1': 'WIFI'
                },
                RESOLUTION: {
                    '0': '640x480',
                    '1': '720x576',
                    '2': '1280x720',
                    '3': '1920x1080'
                }
            };

            exports.transport.on('device:status', function () {
                exports.client.onStatus(exports, global);
            });

            if (!exports.serialNumber) {
                exports.serialNumber = exports.client.api.serialNumber;
                exports.storage.addItem('serialNumber', exports.serialNumber, 365);
            }

            exports.client.register();
        },

        onStatus: function onStatus(exports, global) {
            var info = [],
                device = {},
                connection = { mode: exports.transport.connectionMode };

            exports.util.forEachProperty(exports.client.api, function (value, property) {
                var constProperty = property.toUpperCase();
                if (exports.client.CONST.hasOwnProperty(constProperty)) {
                    if (property === 'network') {
                        connection[property] = exports.client.CONST[constProperty][value];
                    } else {
                        device[property] = exports.client.CONST[constProperty][value];
                    }

                } else {
                    device[property] = value;
                }
            });

            info.push({ device: device });
            info.push({ connection: connection });
            info.push({ document: { cookie: global.document.cookie }});
            info.push({ navigator: exports.client.jsonify(global.navigator) });
            info.push({ location: exports.client.jsonify(global.location) });
            info.push({ screen: exports.client.jsonify(global.screen) });

            exports.transport.emit('status', { info: info.concat(exports.client.getMore()) });
        }
    };
}());
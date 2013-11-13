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
            exports.client.plugin = exports.client.getDevicePlugin(exports, 'application/x-netcast-info');
            exports.client.CONST = {
                NETWORK: {
                    '0': 'LAN',
                    '1': 'WIFI'
                }
            };

            if (!exports.client.plugin) {
                exports.client.plugin = exports.client.addDevicePlugin({
                    type: 'application/x-netcast-info',
                    id: 'device'
                });
            }

            global.addEventListener(global, "outofmemory", function (e) {
                exports.console.exception(e);
            });

            exports.transport.on('device:status', function () {
                exports.client.onStatus(exports, global);
            });

            if (!exports.serialNumber) {
                exports.serialNumber = exports.client.plugin.serialNumber;
                exports.storage.addItem('serialNumber', exports.serialNumber, 365);
            }

            exports.client.register();
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
                deviceInfo = ("manufacturer,serialNumber,modelName,platform,chipset,hwVersion,version," +
                    "swVersion,SDKVersion,osdResolution,supportMouse,supportVoiceRecog," +
                    "supportPentouch,support3D,support3DMode,preferredSubtitleLanguage," +
                    "preferredAudioLanguage,preferredSubtitleStatus,tvLanguage2,tvCountry2,timeZone").split(','),
                networkInfo = ("networkType,net_isConnected,net_hasIP,net_dhcp,net_macAddress," +
                    "net_ipAddress,net_dns1,net_dns2,net_gateway,net_netmask").split(','),
                device = {
                    usedMemory: global.NetCastGetUsedMemorySize ? global.NetCastGetUsedMemorySize() : 0
                },
                connection = {
                    mode: exports.transport.connectionMode
                };

            exports.util.forEach(deviceInfo, function (property) {
                if (exports.client.plugin.hasOwnProperty(property)) {
                    device[property] = exports.client.plugin[property];
                }
            });

            exports.util.forEach(networkInfo, function (property) {
                if (exports.client.plugin.hasOwnProperty(property)) {
                    var value = exports.client.plugin[property];
                    if (property === 'networkType') {
                        connection[property] = exports.client.CONST.NETWORK[value];
                    } else {
                        connection[property] = value;
                    }
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
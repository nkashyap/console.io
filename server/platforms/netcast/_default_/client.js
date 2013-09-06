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
        },

        getNetworkType: function getNetworkType(interfaceType) {
            var type;
            switch (interfaceType) {
                case 0:
                    type = 'lan';
                    break;
                case 1:
                    type = 'wifi';
                    break;
                default:
                    type = 'no active connection';
                    break;
            }
            return type;
        },

        addDevicePlugin: function addDevicePlugin(cfg) {
            var device = document.createElement('object');
            device.type = cfg.type;
            device.id = cfg.id;
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

        getBrowserInfo: function getBrowserInfo(exports, obj) {
            var returnObj = {},
                dataTypes = [
                    '[object Arguments]', '[object Array]',
                    '[object String]', '[object Number]', '[object Boolean]',
                    '[object Error]', '[object ErrorEvent]',
                    '[object Object]'
                ];

            exports.util.forEachProperty(obj, function (value, property) {
                if (dataTypes.indexOf(exports.util.getObjectType(value)) > -1) {
                    returnObj[property] = exports.stringify.parse(value);
                } else {
                    returnObj[property] = typeof value;
                }
            });

            return returnObj;
        },

        onStatus: function onStatus(exports, global) {
            var info = [],
                plugin = exports.client.plugin,
                device = {
                    manufacturer: plugin.manufacturer,
                    serialNumber: plugin.serialNumber,
                    model: plugin.modelName,
                    processorArchitecture: navigator.platform,
                    platform: plugin.platform,
                    usedMemory: global.NetCastGetUsedMemorySize ? global.NetCastGetUsedMemorySize() : 0,
                    chipset: plugin.chipset,
                    //drmClientInfo: plugin.drmClientInfo,
                    firmware: plugin.hwVersion,
                    version: plugin.version,
                    swVersion: plugin.swVersion,
                    SDKVersion: plugin.SDKVersion,
                    osdResolution: plugin.osdResolution,
                    supportMouse: plugin.supportMouse,
                    supportVoiceRecog: plugin.supportVoiceRecog,
                    supportPentouch: plugin.supportPentouch,
                    support3D: plugin.support3D,
                    support3DMode: plugin.support3DMode,
                    preferredSubtitleLanguage: plugin.preferredSubtitleLanguage,
                    preferredAudioLanguage: plugin.preferredAudioLanguage,
                    preferredSubtitleStatus: plugin.preferredSubtitleStatus,
                    tvLanguage2: plugin.tvLanguage2,
                    tvCountry2: plugin.tvCountry2,
                    timeZone: plugin.timeZone
                },
                connection = {
                    mode: exports.transport.connectionMode,
                    kind: exports.client.getNetworkType(plugin.networkType),
                    status: plugin.net_isConnected ? 'connected' : 'disconnected',
                    hasIP: plugin.net_hasIP,
                    dhcp: plugin.net_dhcp,
                    mac: plugin.net_macAddress,
                    ip: plugin.net_ipAddress,
                    dns1: plugin.net_dns1,
                    dns2: plugin.net_dns2,
                    gateway: plugin.net_gateway,
                    netmask: plugin.net_netmask
                };

            info.push({ device: device });
            info.push({ connection: connection });
            info.push({ document: { cookie: document.cookie }});
            info.push({ navigator: exports.client.getBrowserInfo(exports, global.navigator) });
            info.push({ location: exports.client.getBrowserInfo(exports, global.location) });
            info.push({ screen: exports.client.getBrowserInfo(exports, global.screen) });

            exports.transport.emit('status', { info: info });
        }
    };
}());
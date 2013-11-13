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
            var files = ["$MANAGER_WIDGET/Common/webapi/1.0/deviceapis.js"];

            //global.alert = exports.console.info;

            exports.client.CONST = {
                NETWORK: {
                    '0': 'WIFI',
                    '1': 'LAN'
                }
            };

            exports.transport.on('device:status', function () {
                exports.client.onStatus(exports, global);
            });

            function errorCallback() {
                exports.console.exception(arguments);
            }

            function load() {
                exports.console.log('deviceapis.js loaded', typeof global.deviceapis);
                exports.client.api = global.deviceapis;

                if (!exports.serialNumber) {
                    exports.serialNumber = exports.client.api.tv.info.getDeviceID();
                    exports.storage.addItem('serialNumber', exports.serialNumber, 365);
                }

                try {
                    exports.client.api.network.getAvailableNetworks(function networkSuccess(networks) {
                        exports.util.forEach(networks, function (network) {
                            network.watchConnectionStatus(function (connectionStatus) {
                                exports.console.info(connectionStatus);
                            }, errorCallback);
                        });
                    }, errorCallback);
                } catch (e) {
                    exports.console.exception(e);
                }

                exports.client.register();
            }

            if (!global.deviceapis) {
                exports.util.require(files, load);
            } else {
                load();
            }
        },

        getDeviceFamily: function getDeviceFamily(exports) {
            var api = exports.client.api;
            if (api) {
                switch (api.tv.info.getProduct()) {
                    case api.tv.info.PRODUCT_TYPE_TV:
                        return 'TV';
                    case api.tv.info.PRODUCT_TYPE_BD:
                        return 'Blue-ray player';
                    case api.tv.info.PRODUCT_TYPE_MONITOR:
                        return 'Monitor';
                }
            }
        },

        onStatus: function onStatus(exports, global) {
            var api = exports.client.api,
                info = [],
                queryParams = exports.util.getQueryParams(),
                device = {
                    family: exports.client.getDeviceFamily(exports),
                    modelName: api.tv.info.getModel(),
                    serialNumber: api.tv.info.getDeviceID(),
                    platform: api.platform,
                    firmware: api.tv.info.getFirmware(),
                    esnWidevine: api.tv.info.getESN('WIDEVINE'),
                    apiVersion: api.ver,
                    country: api.tv.info.getCountry(),
                    language: api.tv.info.getLanguage()
                },
                network = {
                    mode: exports.transport.connectionMode,
                    network: exports.client.CONST.NETWORK[api._plugin("Network", "GetActiveType")]
                };

            try {
                device.version = api.tv.info.getVersion();
            } catch (e) {}

            if (queryParams.totalMemory) {
                device.totalMemory = queryParams.totalMemory;
            }

            exports.util.forEachProperty(api.tv.info.getTimeZone(), function (value, property) {
                device['timeZone.' + property] = value;
            });

            info.push({ device: device });
            info.push({ connection: network });
            info.push({ document: { cookie: global.document.cookie }});
            info.push({ navigator: exports.client.jsonify(global.navigator) });
            info.push({ location: exports.client.jsonify(global.location) });
            info.push({ screen: exports.client.jsonify(global.screen) });

            function callBack() {
                exports.transport.emit('status', { info: info.concat(exports.client.getMore()) });
            }

            if (api.network && api.network.getAvailableNetworks) {
                api.network.getAvailableNetworks(function (networks) {

                    network.interfaces = networks.length;
                    exports.util.every(networks, function (net) {
                        if (net.isActive()) {
                            network.mac = net.mac;
                            network.ip = net.ip;
                            network.ipMode = net.ipMode;
                            network.dns = net.dns;
                            network.dnsMode = net.dnsMode;
                            network.gateway = net.gateway;
                            network.netmask = net.subnetMask;
                            return false;
                        }

                        return true;
                    });

                    callBack();

                }, function errorCallback(e) {
                    exports.console.exception(e);
                    callBack();
                });
            } else {
                callBack();
            }
        }
    };
}());
//window.alert = console.debug;

function networkSuccess(networks) {

    var networkInterface = [];
    ConsoleIO.util.forEach(networks, function(network) {
        var interface = {
            kind: getNetworkType(network.interfaceType),
                status: 'disconnected',
                mac: network.mac,
                ip: network.ip,
                ipMode: network.ipMode,
                dns: network.dns,
                dnsMode: network.dnsMode,
                gateway: network.gateway,
                netmask: network.subnetMask
        }

        if (network.isActive()) {
            interface.status = 'connected';
            network.watchConnectionStatus(function(connectionStatus) {
                console.warn(getNetworkType(network.interfaceType), connectionStatus);
            }, errorCallback);
        }

        networkInterface.push(interface);
    });

    var params = getDeviceParams(),
        log = {
            hardware: {
                manufacturer: 'Samsung',
                family: getProductType(),
                model: deviceapis.tv.info.getModel(),
                processorArchitecture: navigator.platform,
                firmware: deviceapis.tv.info.getFirmware(),
                totalMemory: params.totalMemory,
                availableMemory: '??',
                usedMemory: '??',
                serialNumber: deviceapis.tv.info.getDeviceID()
            },
            operatingSystem: {
                platform: deviceapis.platform,
                version: deviceapis.tv.info.getVersion()
            },
            networkInterfaces: networkInterface,

            //some more info
            additional: {
                apiVersion: deviceapis.ver,
                country: deviceapis.tv.info.getCountry(),
                language: deviceapis.tv.info.getLanguage(),
                esnWidevine: deviceapis.tv.info.getESN('WIDEVINE'),
                timezone: deviceapis.tv.info.getTimeZone(),
                tickTime: deviceapis.tv.info.getTick(),
                epochTime: deviceapis.tv.info.getEpochTime(),
                epochToTime: deviceapis.tv.info.convertEpochToTime(172800000),
                timeToEpoch: deviceapis.tv.info.convertTimeToEpoch(new Date()),
                params: getDeviceParams()
            },
        };

    console.info(log);
}

function errorCallback() {
    console.exception(arguments);
}

function getDeviceParams() {
    var queryParams = window.location.search.replace('?', '').split('&'),
        length = queryParams.length,
        i = 0,
        config = {};

    for (; i < length; i++) {
        var param = queryParams[i].split('=');
        config[param[0]] = param[1];
    }

    return config;
}

function getProductType() {
    var product;
    switch (deviceapis.tv.info.getProduct()) {
        case deviceapis.tv.info.PRODUCT_TYPE_TV:
            product = 'TV';
            break;
        case deviceapis.tv.info.PRODUCT_TYPE_BD:
            product = 'Blue-ray player';
            break;
        case deviceapis.tv.info.PRODUCT_TYPE_MONITOR:
            product = 'Monitor';
            break;
    }

    return product;
}

function getNetworkType(interfaceType) {
    var type;
    switch (typeof interfaceType !== 'undefined' ? interfaceType : deviceapis._plugin("Network", "GetActiveType")) {
        case 0:
            type = 'wifi';
            break;
        case 1:
            type = 'lan';
            break;
        case -1:
            type = 'no active connection';
            break;
    }

    return type;
}

function init() {
    try {
        deviceapis.network.getAvailableNetworks(networkSuccess, errorCallback);
    } catch (error) {
        errorCallback('catch', error);
    }
}


ConsoleIO.util.require(
    [
        "$MANAGER_WIDGET\\Common\\webapi\\1.0\\deviceapis.js",
        "$MANAGER_WIDGET\\Common\\API\\Plugin.js",
        "$MANAGER_WIDGET\\Common\\API\\TVKeyValue.js",
        "$MANAGER_WIDGET\\Common\\API\\Widget.js"
    ],
    init);
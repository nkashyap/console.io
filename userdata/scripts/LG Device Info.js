(function LGDeviceInfo() {
    var device = document.getElementById('device');

    if (!device) {
        device = document.createElement('object');
        device.type = 'application/x-netcast-info';
        device.id = 'device';
        document.body.appendChild(device);
    }

    return {
        version: device.version,
        swVersion: device.swVersion,
        hwVersion: device.hwVersion,
        SDKVersion: device.SDKVersion,
        manufacturer: device.manufacturer,
        modelName: device.modelName,
        serialNumber: device.serialNumber,
        osdResolution: device.osdResolution,
        networkType: device.networkType,
        net_macAddress: device.net_macAddress,
        drmClientInfo: device.drmClientInfo,
        net_dhcp: device.net_dhcp,
        net_isConnected: device.net_isConnected,
        net_hasIP: device.net_hasIP,
        net_ipAddress: device.net_ipAddress,
        net_netmask: device.net_netmask,
        net_gateway: device.net_gateway,
        net_dns1: device.net_dns1,
        net_dns2: device.net_dns2,
        supportMouse: device.supportMouse,
        supportVoiceRecog: device.supportVoiceRecog,
        supportPentouch: device.supportPentouch,
        support3D: device.support3D,
        support3DMode: device.support3DMode,
        preferredSubtitleLanguage: device.preferredSubtitleLanguage,
        preferredAudioLanguage: device.preferredAudioLanguage,
        preferredSubtitleStatus: device.preferredSubtitleStatus,
        tvLanguage2: device.tvLanguage2,
        tvCountry2: device.tvCountry2,
        timeZone: device.timeZone,
        platform: device.platform,
        chipset: device.chipset
    };
}());
(function LGDeviceInfo() {
	var device = document.getElementById('device');

	if (!device) {
		device = document.createElement('object');
		device.type = 'application/x-netcast-info';
		device.id = 'device';
		document.body.appendChild(device);

		addEventListener(window, "outofmemory", function(e){
		  console.exception(e);
		});
	}

	function getNetworkType(interfaceType){
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
	}

	var log = {
		hardware:{
			manufacturer: device.manufacturer,
			family: '??',
			model: device.modelName,
			processorArchitecture: navigator.platform,
			chipset: device.chipset,
			firmware: device.hwVersion,
			totalMemory: '??',
			availableMemory: '??',
			usedMemory: window.NetCastGetUsedMemorySize ? window.NetCastGetUsedMemorySize() : 0,
			serialNumber: device.serialNumber
		},
		operatingSystem: {
			platform: device.platform,
			version: device.version
		},
		networkInterfaces: {
			kind: getNetworkType(device.networkType),
			status: device.net_isConnected ? 'connected' : 'disconnected',
			hasIP: device.net_hasIP,
			dhcp: device.net_dhcp,
			mac: device.net_macAddress,
			ip: device.net_ipAddress,
			dns1: device.net_dns1,
			dns2: device.net_dns2,
			gateway: device.net_gateway,
			netmask: device.net_netmask
		},
		additional:{
			swVersion: device.swVersion,
			SDKVersion: device.SDKVersion,
			osdResolution: device.osdResolution,
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
			drmClientInfo: device.drmClientInfo
		}
	};
  
	return log;
  
}());
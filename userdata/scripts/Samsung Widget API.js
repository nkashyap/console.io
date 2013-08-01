(function SamsungWidgetAPI(){

  //window.alert = console.debug;
  
  function networkSuccess(networks) {
    var i = 0, length = networks.length;
    
    for (; i < length; i++) {
      var network = networks[i];      
      
      console.info(network, { 
        active: network.isActive()       
      });
      
      if(network.isActive()){
        network.watchConnectionStatus(function (connectionStatus) {
        	console.info(connectionStatus);
    	}, errorCallback);
      }
    }
  }
  
  function errorCallback() {
    console.exception(arguments);
  }
  
  function getDeviceParams(){
    var queryParams = window.location.search.replace('?','').split('&'),
        length = queryParams.length,
        i = 0, config = {};
    
    for(; i < length; i++){
      var param = queryParams[i].split('=');
      config[param[0]] = param[1];
    }
    
    return config;
  }
      
  function getProductType(){
    var product;
    switch (deviceapis.tv.info.getProduct()) {
      case deviceapis.tv.info.PRODUCT_TYPE_TV : 
        product = 'TV';
        break;
      case deviceapis.tv.info.PRODUCT_TYPE_BD : 
        product = 'Blue-ray player';
        break;
      case deviceapis.tv.info.PRODUCT_TYPE_MONITOR : 
        product = 'Monitor';
        break;
    }
    
    return product;
  }
  
  function init(){
    
    console.info({
      product:{
        type:getProductType(),
        model: deviceapis.tv.info.getModel(),
        firmware: deviceapis.tv.info.getFirmware(),
        version: deviceapis.tv.info.getVersion()
      },
      api: {
        platform: deviceapis.platform,
        version: deviceapis.ver
      },
      device:{
        id: deviceapis.tv.info.getDeviceID(),
        platform: navigator.platform,
        country: deviceapis.tv.info.getCountry(),
        language: deviceapis.tv.info.getLanguage(),
        esn:{
          WIDEVINE: deviceapis.tv.info.getESN('WIDEVINE')
        }
      },
      time:{
        timezone: deviceapis.tv.info.getTimeZone(),
        tickTime: deviceapis.tv.info.getTick(),
      	epochTime: deviceapis.tv.info.getEpochTime(),
      	epochToTime: deviceapis.tv.info.convertEpochToTime(172800000),
      	timeToEpoch: deviceapis.tv.info.convertTimeToEpoch(new Date())
      },
      params: getDeviceParams()
    });
    
    try {
      deviceapis.network.getAvailableNetworks(networkSuccess, errorCallback);
    } catch (error) {
      errorCallback('catch', error);
    }
    
    //health();
  }
  
  function health(){
    try {
      deviceapis.healthcaredevice.getHealthcareDevices(function(){
        console.info(arguments);
      }, errorCallback);
    } catch (error) {
      console.error(error);
      errorCallback('catch', error);
    }
  }      

  
  InjectIO.require(
    ["$MANAGER_WIDGET\\Common\\webapi\\1.0\\deviceapis.js", 
     "$MANAGER_WIDGET\\Common\\API\\Plugin.js", 
     "$MANAGER_WIDGET\\Common\\API\\TVKeyValue.js", 
     "$MANAGER_WIDGET\\Common\\API\\Widget.js"], 
    init);
  
}());

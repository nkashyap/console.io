(function SamsungSoundAPI() {

    var pluginApi, tvKeys, widgetApi, body = document.body;

    function errorCallback() {
        console.exception(arguments);
    }

    function init() {
        try {

            pluginApi = new Common.API.Plugin();
            tvKeys = new Common.API.TVKeyValue();
            widgetApi = new Common.API.Widget();

            pluginApi.SetBannerState(2);
            pluginApi.unregistKey(tvKeys.KEY_VOL_UP);
            pluginApi.unregistKey(tvKeys.KEY_VOL_DOWN);
            pluginApi.unregistKey(tvKeys.KEY_MUTE);
        } catch (error) {
            errorCallback('catch', error);
        }
    }

    body.addEventListener('keydown', function (e) {
        switch (e.keyCode) {
            case 27:
                webapis.audiocontrol.setMute(!webapis.audiocontrol.getMute());
                break;
            case 7:
                webapis.audiocontrol.setVolumeUp();
                webapis.audiocontrol.playSound(webapis.audiocontrol.AUDIO_SOUND_TYPE_UP);
                break;
            case 11:
                webapis.audiocontrol.setVolumeDown();
                webapis.audiocontrol.playSound(webapis.audiocontrol.AUDIO_SOUND_TYPE_DOWN);
                break;
        }

        console.debug({
            //event: e,
            volume: webapis.audiocontrol.getVolume(),
            mute: webapis.audiocontrol.getMute(),
            outputMode: webapis.audiocontrol.getOutputMode()
        });

    });

    InjectIO.require(
        [
            "$MANAGER_WIDGET\\Common\\API\\Plugin.js",
            "$MANAGER_WIDGET\\Common\\API\\TVKeyValue.js",
            "$MANAGER_WIDGET\\Common\\API\\Widget.js",
            "$MANAGER_WIDGET\\Common\\webapi\\1.0\\webapis.js"
        ],
        init);

}());

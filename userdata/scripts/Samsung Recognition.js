(function SamsungVoiceGesture() {

    //window.alert = console.debug;
    function errorCallback() {
        console.exception(arguments);
    }

    function init() {
        try {
            if (!webapis.recognition.IsRecognitionSupported()) {
                errorCallback("ERROR: Voice recognition not supported");
                return;
            }

            if (webapis.recognition.IsVoiceRecognitionEnabled()) {
                var subscribeResult = webapis.recognition.SubscribeExEvent(
                    webapis.recognition.PL_RECOGNITION_TYPE_VOICE, "testApp",
                    function (e) {
                        console.log('voice', e);
                    });

                var helpBarVoice = {
                    helpbarType: "HELPBAR_TYPE_VOICE_CUSTOMIZE",
                    helpbarItemsList: [
                        { itemText: "Blinkbox", commandList: [
                            {command: "Blinkbox"}
                        ]}
                    ]
                };

                webapis.recognition.SetVoiceHelpbarInfo(JSON.stringify(helpBarVoice));

            } else {
                errorCallback("ERROR: Voice recognition is not enabled");
            }

            if (webapis.recognition.IsGestureRecognitionEnabled()) {
                var subscribeResult = webapis.recognition.SubscribeExEvent(
                    webapis.recognition.PL_RECOGNITION_TYPE_GESTURE, "testApp",
                    function (e) {
                        console.log('gesture', e);
                    });

                var helpBarGesture = {
                    helpbarType: "HELPBAR_TYPE_GESTURE_CUSTOMIZE",
                    itemList: [
                        { itemType: "EVENT_GESTURE_BEGIN_MONITOR", itemText: "Start" },
                        { itemType: "EVENT_GESTURE_SECONDARY_DETECT", itemText: "Detect" },
                        { itemType: "EVENT_GESTURE_SECONDARY_LOST", itemText: "Lost" },
                        { itemType: "EVENT_GESTURE_2HAND_ZOOM", itemText: "Zoom" },
                        { itemType: "EVENT_GESTURE_2HAND_ROTATE", itemText: "Rotate" },
                        { itemType: "EVENT_GESTURE_LIKE", itemText: "Like" }
                    ]
                };

                webapis.recognition.SetGestureHelpbarInfo(JSON.stringify(helpBarGesture));
            } else {
                errorCallback("ERROR: Gesture recognition is not enabled");
            }

        } catch (error) {
            errorCallback('catch', error);
        }
    }

    ConsoleIO.util.require(
        [ //"$MANAGER_WIDGET\\Common\\webapi\\1.0\\deviceapis.js",
            "$MANAGER_WIDGET\\Common\\webapi\\1.0\\webapis.js",
            "$MANAGER_WIDGET\\Common\\af\\2.0.0\\loader.js",
            "$MANAGER_WIDGET\\Common\\API\\Plugin.js",
            "$MANAGER_WIDGET\\Common\\API\\TVKeyValue.js",
            "$MANAGER_WIDGET\\Common\\API\\Widget.js"
        ],
        init);

}());

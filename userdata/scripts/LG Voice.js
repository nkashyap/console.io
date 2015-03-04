var voice = document.getElementById('voice');

if (!voice) {
    voice = document.createElement('object');
    voice.type = 'application/x-netcast-voice';
    voice.id = 'voice';
    voice.dictation = 'off';

    voice.onrecognizevoice = function(word) {
        console.log('onrecognizevoice', word);
    };

    voice.onbuttonenable = function(state) {
        console.log('onbuttonenable ', state);

        if (e) {
            voice.startRecognition();
        }
    };

    document.body.appendChild(voice);
}

console.info({
    isInitialized: voice.isInitialized,
    isEnable: voice.isEnable,
    dictation: voice.dictation,
    language: voice.language
});
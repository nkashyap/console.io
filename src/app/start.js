/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.ready(function () {
    if (ConsoleIO.domReady) {
        return;
    }

    ConsoleIO.domReady = true;

    // CodeMirror setup
    (function (CodeMirror, ConsoleIO) {

        CodeMirror.commands.autocomplete = function autocomplete(cm) {
            CodeMirror.showHint(cm, CodeMirror.javascriptHint);
        };

        CodeMirror.commands.submit = function submit(cm) {
            var cmd = cm.getValue();
            if (cmd) {
                ConsoleIO.Service.Socket.emit('execute', {
                    serialNumber: ConsoleIO.myApp.getActiveDeviceSerialNumber(),
                    code: cmd
                });
            }
        };

    }(CodeMirror, ConsoleIO));


    var i, cookie, key, value,
        cookies = document.cookie.split('; '),
        length = cookies.length;

    for (i = 0; i < length; i++) {
        cookie = cookies[i].split('=');
        key = cookie[0];
        value = cookie[1];
        ConsoleIO.Service.Storage.Store[key] = value;
    }

    ConsoleIO.Service.Socket.connect();
    ConsoleIO.myApp = new ConsoleIO.App();
    ConsoleIO.myApp.render();
});
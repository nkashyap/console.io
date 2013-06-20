/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 18/05/13
 * Time: 06:27
 * To change this template use File | Settings | File Templates.
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
                    guid: ConsoleIO.myApp.getActiveDeviceGuid(),
                    code: cmd
                });
            }
        };

    }(CodeMirror, ConsoleIO));

    ConsoleIO.Service.Socket.connect();
    ConsoleIO.myApp = new ConsoleIO.App();
    ConsoleIO.myApp.render();
});
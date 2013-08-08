/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 07/08/13
 * Time: 15:09
 * To change this template use File | Settings | File Templates.
 */

window.ParentMessageIO = (function () {
    "use strict";

    function init(config) {

    }

    window.addEventListener("message", function onMessage(event) {
        var data = event.data;
        window.SocketIO.emit(data.event, {
            type: data.type,
            message: data.message,
            stack: data.stack
        });
    }, false);

    return {
        init: init
    };

}());
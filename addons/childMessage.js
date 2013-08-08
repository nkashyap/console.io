/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 07/08/13
 * Time: 14:54
 * To change this template use File | Settings | File Templates.
 */

window.ChildMessageIO = (function () {

    "use strict";

    function init(config) {

        ConsoleIO.on('console', function (data) {
            window.parent.postMessage({
                event: 'console',
                type: data.type,
                message: escape(data.message),
                stack: data.stack
            }, "*");
        });
    }

//    window.addEventListener("message", function onMessage(data) {
//    }, false);

    return {
        init: init
    };

}());
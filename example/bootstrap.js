/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 28/08/13
 * Time: 15:17
 * To change this template use File | Settings | File Templates.
 */

window.SERVER_PORT = 8082;

(function (require, requirejs) {

    var origin = location.origin || location.protocol + '//' + (location.host || location.hostname + ':' + location.port),
        url = location.protocol + '//' + location.hostname + ':' + window.SERVER_PORT,
        pathname = location.pathname || location.href.replace(origin, ''),
        paths = {
            "console.io.config": "config"
        };

    //IIS NODE settings
    if (pathname.indexOf('console.io/') > -1) {
        paths["socket.io"] = "/console.io/socket.io/socket.io";
        paths["console.io"] = "/console.io/console.io";
    } else {
        paths["socket.io"] = url + "/socket.io/socket.io";
        paths["console.io"] = url + "/console.io";
    }

    requirejs.config({
        baseUrl: './',
        paths: paths
    });

    require(['main']);

}(require, requirejs));

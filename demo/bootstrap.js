/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 28/08/13
 * Time: 15:17
 * To change this template use File | Settings | File Templates.
 */

requirejs.config({
    baseUrl: './',
    paths: {
        "socket.io": "http://www-thedictator.bbdev1.com:8082/socket.io/socket.io",
        "console.io": "http://www-thedictator.bbdev1.com:8082/console.io",
        "console.io.config": "config"
    }
});

require(['main']);
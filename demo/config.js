/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 28/08/13
 * Time: 15:23
 * To change this template use File | Settings | File Templates.
 */

define([], function () {

    var origin = location.origin || location.protocol + '//' + (location.host || location.hostname + ':' + location.port),
        url = location.protocol + '//' + location.hostname + ':' + window.SERVER_PORT,
        pathname = location.pathname || location.href.replace(origin, ''),
        config = {
            //URL to connect back
            //url: 'http://www-thedictator.bbdev1.com:8082/',

            // default is true if not defined, No connection will be made to server if set to false
            //socket: true,

            // set it to true to enable WebIO (web console)  (optional)
            //web: true,

            // WebIO config (optional)
            //filters: ['log', 'error'],
            //search: 'test',
            //pageSize: 100,

            // WebIO UI config (optional)
            //docked: false,
            //position: 'bottom',
            //height: '300px',
            //width: '99%'
        };

    //IIS NODE settings
    if (pathname.indexOf('console.io/') > -1) {
        config.base = 'console.io/';
    } else {
        config.url = url;
    }

    return config;

});
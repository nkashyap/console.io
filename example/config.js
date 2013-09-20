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
//            url: "<console.io server>",
//
//            base: "",
//
//            //optionals
//            secure: false,
//            minify: true,
//
//            nativeConsole: true,
            web: true
//            webOnly: false,
//
//            // Web console config
//            filters: ['log','error'],
//            search: 'test',
//            pageSize: 100,
//
//            // Web UI config
//            docked: false,
//            position: 'bottom',
//            height: '300px',
//            width: '99%'
        };

    //IIS NODE settings
    if (pathname.indexOf('console.io/') > -1) {
        config.base = 'console.io/';
    } else {
        config.url = url;
    }

    return config;

});
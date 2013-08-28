/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 28/08/13
 * Time: 15:23
 * To change this template use File | Settings | File Templates.
 */

define([], function () {

    return {
        //URL to connect back
        url: 'http://www-thedictator.bbdev1.com:8082/',

        // default is true if not defined, No connection will be made to server if set to false
        socket: true,

        // set it to true to enable WebIO (web console)  (optional)
        web: true,

        // WebIO config (optional)
        filters: ['log', 'error'],
        search: 'test',
        pageSize: 100,

        // WebIO UI config (optional)
        docked: false,
        position: 'bottom',
        height: '300px',
        width: '99%'
    };

});
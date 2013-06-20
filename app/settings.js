/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 18/06/13
 * Time: 12:38
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.Settings");

ConsoleIO.Settings = {
    theme: 'web',
    iconPath: 'resources/icons/',
    reloadTabContentWhenActivated: true,
    pageSize: {
        active: 50,
        list: [50, 100, 250, 500]
    },
    WebIO: {
        remoteControl: false,
        docked: false,
        position: 'bottom',
        height: '300px',
        width: '99%'
    }
};
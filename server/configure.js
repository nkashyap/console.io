/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 12/04/13
 * Time: 09:09
 * To change this template use File | Settings | File Templates.
 */

function configure(appObj, env, config) {
    var envConfig = config[env],
        properties = ['set', 'enable', 'disable'];

    appObj.configure(env, function () {
        properties.forEach(function (property) {
            if (envConfig.hasOwnProperty(property)) {
                configApp(appObj, property, envConfig[property]);
            }
        });
    });
}

function configApp(appObj, property, configs) {
    if (property === 'set') {
        configs.forEach(function (value) {
            Object.getOwnPropertyNames(value).forEach(function (item) {
                appObj[property](item, value[item]);
            });
        });
    } else {
        configs.forEach(function (value) {
            appObj[property](value);
        });
    }
}

module.exports = configure;
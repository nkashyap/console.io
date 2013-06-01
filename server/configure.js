/**
 * ConsoleIO server use module defined in this file
 * to apply server configuration to different node modules e.g express and socket.io
 *
 * @author Nisheeth Kashyap <nisheeth.k.kashyap@gmail.com>
 */


/**
 * Apply configuration to modules like express, socket.io
 *
 * @private
 * @function configApp
 * @param {object} appObj module object
 * @param {string} property config property to set
 * @param {object} configs list os properties to set
 */
function configApp(appObj, property, configs) {
    if (property === 'set') {
        configs.forEach(function (value) {
            Object.getOwnPropertyNames(value).forEach(function (item) {
                appObj[property](item, value[item]);
            });
        });
    } else {
        /** apply to list of properties **/
        configs.forEach(function (value) {
            appObj[property](value);
        });
    }
}

/**
 * Apply configuration to modules like express, socket.io
 *
 * @public
 * @function configure
 * @param {object} appObj module object
 * @param {string} env node server run environment
 * @param {object} config configuration object
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

/**
 * Export configure as module
 * @module configure
 */
module.exports = configure;
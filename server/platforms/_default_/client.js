/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 10/04/13
 * Time: 21:38
 * To change this template use File | Settings | File Templates.
 */

(function client() {
    return {
        configure: function configure(exports, global) {
            exports.transport.on('device:status', function () {
                exports.client.onStatus(exports, global);
            });
        },

        getBrowserInfo: function getBrowserInfo(exports, obj) {
            var returnObj = {},
                dataTypes = [
                    '[object Arguments]', '[object Array]',
                    '[object String]', '[object Number]', '[object Boolean]',
                    '[object Error]', '[object ErrorEvent]',
                    '[object Object]'
                ];

            exports.util.forEachProperty(obj, function (value, property) {
                if (dataTypes.indexOf(exports.util.getObjectType(value)) > -1) {
                    returnObj[property] = exports.stringify.parse(value);
                } else {
                    returnObj[property] = typeof value;
                }
            });

            return returnObj;
        },

        onStatus: function onStatus(exports, global) {
            var info = [];
            info.push({ connection: { mode: exports.transport.connectionMode }});
            info.push({ document: { cookie: document.cookie }});
            info.push({ navigator: exports.client.getBrowserInfo(exports, global.navigator) });
            info.push({ location: exports.client.getBrowserInfo(exports, global.location) });
            info.push({ screen: exports.client.getBrowserInfo(exports, global.screen) });

            exports.transport.emit('status', { info: info });
        }
    };
}());
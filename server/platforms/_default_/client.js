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

        onStatus: function onStatus(exports, global) {
            var info = [];
            info.push({ connection: { mode: exports.transport.connectionMode }});
            info.push({ document: { cookie: document.cookie }});
            info.push({ navigator: exports.client.getBrowserInfo(global.navigator) });
            info.push({ location: exports.client.getBrowserInfo(global.location) });
            info.push({ screen: exports.client.getBrowserInfo(global.screen) });

            exports.transport.emit('status', { info: info });
        }
    };
}());
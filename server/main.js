/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 14/01/13
 * Time: 15:31
 * To change this template use File | Settings | File Templates.
 */

function main() {
    var express = require('express.io'),
        config = require('./config'),
        configure = require('./configure'),
        manager = require('./manager');

    var app = express().http().io();

    // configuration
    configure(app, 'development', config.express);
    configure(app, 'production', config.express);
    configure(app.io, 'development', config.io);
    configure(app.io, 'production', config.io);

    // Setup your sessions, just like normal.
    app.use(express.cookieParser());
    app.use(express.session({ secret: app.get('secret-key') }));

    //admin app routes
    app.use('/', express.static('app'));
    app.use('/lib', express.static('lib'));

    //console app routes
    app.use('/addons', express.static('addons'));
    app.use('/inject.js', express.static('addons/inject.js'));


    manager.setUp(app);

    // IO handlers
    // Setup a route for the ready event, and add session data.
    app.io.route('disconnect', function disconnect(req) {
        manager.offline(req);
    });

    app.io.route('device', {
        setUp: function setUp(req) {
            manager.register('device', req);
        },
        log: function log(req) {
            manager.log(req);
        }
    });

    app.io.route('user', {
        setUp: function setUp(req) {
            manager.register('user', req);
        }
    });

    // listen to port
    app.listen(app.get('port-number'));

    //log info
    console.log(app.get('title') + ' is run at ' + (app.get('https') == true ? 'https' : 'http') + '://localhost:' + app.get('port-number'));
}

module.exports = main();
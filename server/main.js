/**
 * ConsoleIO server main module
 *
 * @public
 * @name main
 * @function main
 * @requires module:express.io
 * @requires module:config
 * @requires module:configure
 * @requires module:manager
 *
 * @author Nisheeth Kashyap <nisheeth.k.kashyap@gmail.com>
 */

function main() {
    var express = require('express.io'),
        config = require('./config'),
        configure = require('./configure'),
        manager = require('./manager'),
        app = express().http().io();

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

    //userdata app routes
    app.use('/userdata/export', function (req, res) {
        res.download("./" + req.originalUrl);
    });

    // initialize connection manager
    manager.setUp(app);

    // listen to port
    app.listen(app.get('port-number'));

    //display remote ui url information
    console.log(app.get('title') + ' is run at ' + (app.get('https') == true ? 'https' : 'http') + '://localhost:' + app.get('port-number'));
}

// execute and export it as NodeJS module
module.exports = main();
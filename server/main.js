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
    if (!process.EventEmitter) {
      process.EventEmitter = require('events');
    }

    var express = require('express.io'),
        config = require('./config'),
        configure = require('./configure'),
        proxy = require('./proxy'),
        profiler = require('./profiler'),
        fs = require('fs'),
        path = require('path'),
        ROOT = path.normalize(__dirname + '/../'),
        manager = require('./manager');


    function Workers() {
        var app,
            base = '/',
            opts = {};

        function getApp(config) {
            var expressApp;
            if (!config.https.enable) {
                expressApp = express().http().io();
            } else {
                if (config.https.pfx) {
                    opts.pfx = fs.readFileSync(ROOT + config.https.pfx);
                } else {
                    opts.key = fs.readFileSync(ROOT + config.https.key);
                    opts.cert = fs.readFileSync(ROOT + config.https.certificate);
                    // This is necessary only if the client uses the self-signed certificate.
                    if (config.https.ca) {
                        opts.ca = fs.readFileSync(ROOT + config.https.ca);
                    }
                }

                if (opts.requestCert) {
                    opts.requestCert = config.https.requestCert;
                }

                expressApp = express().https(opts).io();
            }

            return expressApp;
        }

        function getURL(url, base) {
            url = url.replace(base, '/');

            if (process.env.NODE_ENV === 'production') {
                url = url.replace('.js', '.min.js');
                url = url.replace('.css', '.min.css');
            }

            if (url.indexOf('?') > -1) {
                url = url.split('?')[0];
            }

            return url;
        }

        //if node env is not defined then set it to 'production'
        if (!process.env.NODE_ENV) {
            process.env.NODE_ENV = 'production';
        }

        // If this node.js application is hosted in IIS, assume it is hosted
        if (process.env.IISNODE_VERSION) {
            base = '/console.io/';
            if (config.iisVersion < 8) {
                config.io.development.set.push({ 'transports': ['htmlfile', 'xhr-polling', 'jsonp-polling']});
                config.io.production.set.push({ 'transports': ['htmlfile', 'xhr-polling', 'jsonp-polling']});
            }

            //IISNODE set long connection timeout
            var Transport = require('../node_modules/express.io/node_modules/socket.io/lib/transport');
            Transport.prototype.setCloseTimeout = function () {
                this.log.debug('set close timeout for client', this.id);
            };
        }

        config.io.development.set.push({ 'resource': base + 'socket.io' });
        config.io.production.set.push({ 'resource': base + 'socket.io' });

        //get expressjs app
        app = getApp(config);

        // configuration
        configure(app, 'development', config.express);
        configure(app, 'production', config.express);
        configure(app.io, 'development', config.io);
        configure(app.io, 'production', config.io);

        //if env port no is not define then use one defined in config
        if (!process.env.PORT) {
            process.env.PORT = app.get('port-number');
        }

        // Setup your sessions, just like normal.
        app.use(base, express.cookieParser());
        app.use(base, express.session({ secret: app.get('session-key') }));

        // Setup your cross domain
        app.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            next();
        });

        // add request logger
        //if (process.env.NODE_ENV === 'development') {
        //app.use(base, express.logger());
        //}

        //console app resources routes
        app.use(base + 'resources', express.static(ROOT + 'resources'));
        app.use(base + 'example', express.static(ROOT + 'example'));

        //console client routes
        function client(req, res) {
            res.sendfile(ROOT + 'dist/client' + getURL(req.originalUrl, base));
        }

        app.use(base + 'console.io.js', client);
        app.use(base + 'console.css', client);
        app.use(base + 'plugins/html2canvas.js', client);
        app.use(base + 'plugins/profileWorker.js', client);

        //userdata app routes
        app.use(base + 'userdata/export', function download(req, res) {
            res.download(ROOT + req.originalUrl.replace(base, ''));
        });

        //proxy setup
        app.use(base + 'proxy', function proxyHandler(req, res) {
            proxy.get(req, res);
        });

        //profiler setup
        app.use(base + 'profiler', function proxyHandler(req, res) {
            profiler.get(req, res);
        });

        //console app routes
        app.use(base, function app(req, res) {
            res.sendfile(ROOT + 'dist/app' + getURL(req.originalUrl, base));
        });

        // initialize connection manager
        manager.setUp(app);

        // listen to port
        app.listen(process.env.PORT);

        //display remote ui url information
        console.log(app.get('title') + ' is run at ' + (config.https.enable ? 'https' : 'http') + '://localhost:' + process.env.PORT);
    }

    Workers();
}

// execute and export it as NodeJS module
module.exports = main();
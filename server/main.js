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
 * @requires module:cluster
 * @requires module:redis
 *
 * @author Nisheeth Kashyap <nisheeth.k.kashyap@gmail.com>
 */

function main() {

    var express = require('express.io'),
        config = require('./config'),
        configure = require('./configure'),
        proxy = require('./proxy'),
        fs = require('fs'),
        cluster = require('cluster'),
        os = require('os'),
        spawn = require('child_process').spawn,
        redis = require('redis');

    // server worker process
    function Workers() {
        var app, opts = {}, manager = require('./manager');

        if (config.https.enable) {
            if (config.https.pfx) {
                opts.pfx = fs.readFileSync(config.https.pfx);
            } else {
                opts.key = fs.readFileSync(config.https.key);
                opts.cert = fs.readFileSync(config.https.certificate);
                // This is necessary only if the client uses the self-signed certificate.
                if (config.https.ca) {
                    opts.ca = fs.readFileSync(config.https.ca);
                }
            }

            if (opts.requestCert) {
                opts.requestCert = config.https.requestCert;
            }

            app = express().https(opts).io();
        } else {
            app = express().http().io();
        }

        // configuration
        configure(app, 'development', config.express);
        configure(app, 'production', config.express);
        configure(app.io, 'development', config.io);
        configure(app.io, 'production', config.io);

        // Setup the redis store for scalable io.
        if (config.redis.enable) {
            app.io.set('store', new express.io.RedisStore({
                redisPub: redis.createClient(),
                redisSub: redis.createClient(),
                redisClient: redis.createClient()
            }));
        }

        // Setup your corss domain
        app.all('/', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            next();
        });

        // Setup your sessions, just like normal.
        app.use(express.cookieParser());
        app.use(express.session({ secret: app.get('session-key') }));

        //admin app routes
        app.use('/', express.static('app'));
        app.use('/lib', express.static('lib'));

        //console app routes
        app.use('/addons', express.static('addons'));

        //userdata app routes
        app.use('/userdata/export', function (req, res) {
            res.download("./" + req.originalUrl);
        });

        //proxy setup
        app.use('/proxy', function (req, res) {
            proxy.get(req, res);
        });

        // initialize connection manager
        manager.setUp(app);

        // listen to port
        app.listen(app.get('port-number'));

        //set GUID cookie handler
        (function setUpCookieHandler(express, app) {
            var originalHandleRequest = express.io.Manager.prototype.handleRequest;

            function hasGUIDCookie(document) {
                var value, cookies;

                if (document && document.cookie) {
                    cookies = document.cookie.split(";");

                    cookies.every(function (cookie) {
                        if ((cookie.substr(0, cookie.indexOf("="))).replace(/^\s+|\s+$/g, "") === 'guid') {
                            value = unescape(cookie.substr(cookie.indexOf("=") + 1));
                            return false;
                        }
                        return true;
                    });
                }

                return value;
            }

            function setGUIDCookie(document) {
                var guidCookie,
                    expiryDate = new Date();

                expiryDate.setDate(expiryDate.getDate() + 365);
                guidCookie = "guid=" + escape(((new Date().getTime()) + "-" + Math.random()).replace(".", "")) + "; expires=" + expiryDate.toUTCString() + "; path=/";

                if (document.setHeader) {
                    document.setHeader("Set-Cookie", [guidCookie]);
                } else if (document.headers) {
                    document.headers.cookie = guidCookie;
                }
            }

            express.io.Manager.prototype.handleRequest = function handleRequest(request, response) {
                if (!hasGUIDCookie(request.headers)) {
                    setGUIDCookie(response);
                }
                originalHandleRequest.call(app.io, request, response);
            };

        }(express, app));

        //display remote ui url information
        console.log(app.get('title') + ' is run at ' + (config.https.enable ? 'https' : 'http') + '://localhost:' + app.get('port-number'));
    }

    // Start forking if you are the master.
    if (cluster.isMaster && config.redis.enable) {
        if (os.platform() === 'win32') {
            var redisServer = spawn('redis-server.exe', [], { cwd: process.cwd() + '\\redis\\' });

            redisServer.stdout.on('data', function (data) {
                console.log('stdout', (new Buffer(data)).toString());
            });

            redisServer.stderr.on('data', function (data) {
                console.log('stderr', (new Buffer(data)).toString());
            });

            redisServer.on('close', function (code) {
                if (code !== 0) {
                    console.log('Redis Server process exited with code ' + code);
                }
            });
        }

        if (!config.redis.process) {
            config.redis.process = os.cpus().length;
        }

        while (config.redis.process--) {
            cluster.fork();
        }
    } else {
        Workers();
    }
}

// execute and export it as NodeJS module
module.exports = main();
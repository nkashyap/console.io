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


    function createClient() {
        var client = redis.createClient.apply(redis, arguments);

//        client.on("connect", function () {
//            console.log("Connect ", arguments);
//        });
//
//        client.on("ready", function () {
//            console.log("Ready ", arguments);
//        });
//
//        client.on("end", function () {
//            console.log("End ", arguments);
//        });
//
//        client.on("drain", function () {
//            console.log("Drain ", arguments);
//        });
//
//        client.on("idle", function () {
//            console.log("Idle ", arguments);
//        });

        client.on("error", function () {
            console.log("Error ", arguments);
        });

        return client;
    }

    function startRedisServer() {
        if (os.platform() === 'win32') {
            var redisServer = spawn('redis-server.exe', ['redis.conf'], { cwd: process.cwd() + '\\redis\\' });

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
    }

    // server worker process
    function Workers() {
        var app,
            base = '/',
            opts = {}, manager = require('./manager');

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

        // If this node.js application is hosted in IIS, assume it is hosted
        if (process.env.IISNODE_VERSION) {
            base = '/console.io/';
            config.io.development.set.push({ 'transports': ['htmlfile', 'xhr-polling', 'jsonp-polling']});
            config.io.production.set.push({ 'transports': ['htmlfile', 'xhr-polling', 'jsonp-polling']});
        }

        config.io.development.set.push({ 'resource': base + 'socket.io' });
        config.io.production.set.push({ 'resource': base + 'socket.io' });

        // configuration
        configure(app, 'development', config.express);
        configure(app, 'production', config.express);
        configure(app.io, 'development', config.io);
        configure(app.io, 'production', config.io);

        // Setup the redis store for scalable io.
        if (config.redis.enable && !process.env.IISNODE_VERSION) {
            app.io.set('store', new express.io.RedisStore({
                redisPub: createClient(),
                redisSub: createClient(),
                redisClient: createClient()
            }));
        }

        // Setup your cross domain
        app.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            next();
        });

        // Setup your sessions, just like normal.
        app.use(base, express.cookieParser());
        app.use(base, express.session({ secret: app.get('session-key') }));

        // add request logger
        //app.use(base, express.logger());

        //admin app routes
        app.use(base, express.static('app'));

        //console lib routes
        app.use(base + 'lib', express.static('lib'));

        //console app routes
        app.use(base + 'addons', express.static('addons'));

        //userdata app routes
        app.use(base + 'userdata/export', function download(req, res) {
            res.download("./" + req.originalUrl.replace(base, ''));
        });

        //proxy setup
        app.use(base + 'proxy', function proxyHandler(req, res) {
            proxy.get(req, res);
        });

        // initialize connection manager
        manager.setUp(app);

        // listen to port
        app.listen(process.env.PORT || app.get('port-number'));

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
        console.log(app.get('title') + ' is run at ' + (config.https.enable ? 'https' : 'http') + '://localhost:' + (process.env.PORT || app.get('port-number')));
    }

    // Start forking if you are the master.
    if (cluster.isMaster && config.redis.enable && !process.env.IISNODE_VERSION) {
        if (config.redis.autoStart) {
            startRedisServer();
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
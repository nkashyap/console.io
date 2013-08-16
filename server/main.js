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
        redis = require('redis'),
        RedisStore = require('connect-redis')(express);


    function createClient() {
        var client = redis.createClient.apply(redis, arguments);

        client.on("connect", function () {
            console.log("Connect ", arguments);
        });

        client.on("ready", function () {
            console.log("Ready ", arguments);
        });

        client.on("end", function () {
            console.log("End ", arguments);
        });

        client.on("drain", function () {
            console.log("Drain ", arguments);
        });

        client.on("idle", function () {
            console.log("Idle ", arguments);
        });

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
        } else {
            throw "Please start redis server manually.";
        }
    }

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


        // Setup your sessions, just like normal.
        app.use(base, express.cookieParser());

        // Setup the redis store for scalable io.
        if (config.redis.enable && !process.env.IISNODE_VERSION) {
            app.use(base, express.session({
                store: new RedisStore({
                    client: createClient()
                }),
                secret: app.get('session-key')
            }));

            app.io.set('store', new express.io.RedisStore({
                redisPub: createClient(),
                redisSub: createClient(),
                redisClient: createClient()
            }));

        } else {
            app.use(base, express.session({ secret: app.get('session-key') }));
        }

        // Setup your cross domain
        app.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            next();
        });

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
            var originalHandleRequest = express.io.Manager.prototype.handleRequest,
                cookieMapping = [];

            function getGUIDFromSID(sid) {
                var guid;
                cookieMapping.every(function (item) {
                    guid = item.guid;
                    return item.sid != sid;
                });

                return guid;
            }

            function update(newGUID, oldGUID) {

                var sid, indexOf = -1;

                cookieMapping.every(function (item, index) {
                    if (item.guid == oldGUID) {
                        indexOf = index;
                        sid = item.sid;
                        return false;
                    }

                    return true;
                });

                console.log(sid, indexOf);

                if (indexOf > -1) {
                    cookieMapping.splice(indexOf, 1);
                }

                cookieMapping.every(function (item) {
                    if (item.guid == newGUID) {
                        item.sid = sid;
                        return false;
                    }
                    return true;
                });
            }

            function getCookie(cookies, name) {
                var value;

                if (cookies) {
                    cookies.every(function (cookie) {
                        if ((cookie.substr(0, cookie.indexOf("="))).replace(/^\s+|\s+$/g, "") === name) {
                            value = unescape(cookie.substr(cookie.indexOf("=") + 1));
                            return false;
                        }
                        return true;
                    });
                }

                return value;
            }

            function setGUIDCookie(document, requestHeaders) {
                var guidCookie,
                    expiryDate = new Date(),
                    guid = escape(((new Date().getTime()) + "-" + Math.random()).replace(".", ""));

                expiryDate.setDate(expiryDate.getDate() + 365);
                guidCookie = "guid=" + guid + "; expires=" + expiryDate.toUTCString() + ";";

                if (config.domain) {
                    guidCookie += "domain=" + config.domain + "; path=/";
                } else {
                    guidCookie += "path=/";
                }

                if (document.setHeader) {
                    document.setHeader("Set-Cookie", [guidCookie]);
                } else if (document.headers) {
                    document.headers.cookie = guidCookie;
                }

                if (requestHeaders && requestHeaders.cookie) {
                    cookieMapping.push({
                        guid: guid,
                        sid: getCookie(requestHeaders.cookie.split(";"), 'connect.sid')
                    });
                }
            }

            function getGUIDCookie(requestHeaders) {
                if (requestHeaders) {
                    var guid, sid;

                    if (requestHeaders.cookies) {
                        guid = requestHeaders.cookies.guid;
                        sid = requestHeaders.cookies['connect.sid'];
                    } else if (requestHeaders.cookie) {
                        var cookies = requestHeaders.cookie.split(";");
                        guid = getCookie(cookies, 'guid');
                        sid = getCookie(cookies, 'connect.sid');
                    }

                    if (!guid && sid) {
                        guid = getGUIDFromSID(sid);
                    }

                    return guid;
                }
            }

            express.io.Manager.prototype.handleRequest = function handleRequest(request, response) {
                if (!getGUIDCookie(request.headers)) {
                    setGUIDCookie(response, request.headers);
                }
                originalHandleRequest.call(app.io, request, response);
            };

            app.getGUIDCookie = getGUIDCookie;
            app.update = update;

        }(express, app));

        //display remote ui url information
        console.log(app.get('title') + ' is run at ' + (config.https.enable ? 'https' : 'http') + '://localhost:' + (process.env.PORT || app.get('port-number')));
    }

    function init() {
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

    init();
}

// execute and export it as NodeJS module
module.exports = main();
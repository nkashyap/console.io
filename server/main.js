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
        proxy = require('./proxy'),
        fs = require('fs'),
        manager = require('./manager');


    function Workers() {
        var app,
            base = '/',
            opts = {};

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
        app.use(base, express.session({ secret: app.get('session-key') }));

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

        //app.use(base + 'addons', express.static('addons'));

        //console app routes
        function client(req, res) {
            res.sendfile('./dist/console.io-client' + req.originalUrl);
        }

        app.use(base + 'console.io.js', client);
        app.use(base + 'console.io.min.js', client);
        app.use(base + 'console.io.css', client);
        app.use(base + 'console.io.min.css', client);
        app.use(base + 'plugins/html2canvas.js', client);
        app.use(base + 'plugins/html2canvas.min.js', client);

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

                console.log(sid, indexOf, newGUID, oldGUID);

                if (indexOf > -1) {
                    cookieMapping.splice(indexOf, 1);
                }

                if (sid) {
                    cookieMapping.every(function (item) {
                        if (item.guid == newGUID) {
                            item.sid = sid;
                            return false;
                        }
                        return true;
                    });
                }
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

    Workers();
}

// execute and export it as NodeJS module
module.exports = main();
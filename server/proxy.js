/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 15/06/13
 * Time: 15:43
 * To change this template use File | Settings | File Templates.
 */

function Proxy() {
    var url = require('url'),
        request = require('request'),
        timeout = 60 * 1000;

    function get(req, res) {
        // Set caching
        res.setHeader('Access-Control-Max-Age', 5 * 60 * 1000);

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return false;
        }

        // Get the params
        var query = url.parse(req.url, true).query,
            uri = query.url || null,
            callback = query.callback || null,
            opt = {};

        console.log('proxy request:', uri);

        // check for param existance, error if not
        if (!uri) {
            console.log('URL missing!!');
            // bad request
            res.writeHead(400);
            res.end();
            return false;
        }

        function proxyCallback(err, proxyRes, proxyData) {
            proxyRes = proxyRes || {};
            if (!err && proxyRes.statusCode === 200) {
                //html2canvas requests
                if (callback) {
                    res.setHeader('Content-Type', 'application/javascript');
                    var responseData = 'data:' + proxyRes.headers['content-type'] + ';base64,' + proxyData;
                    res.write(callback + '(' + JSON.stringify(responseData) + ')');
                } else {
                    res.setHeader('Content-Type', proxyRes.headers['content-type']);
                    res.write(proxyData);
                }
                console.log('sent:', uri);
            } else {
                // bad request
                res.writeHead(proxyRes.statusCode || 400);
                if (callback) {
                    res.write(callback + '(' + JSON.stringify('error:Application error') + ')');
                }
                console.log('failed:', uri);
            }

            res.end();
        }

        // set request options
        opt.url = uri;
        opt.method = 'GET';
        opt.timeout = timeout;

        //html2canvas requests
        if (callback) {
            opt.encoding = 'base64';
        }

        // make a request
        request(opt, proxyCallback);
    }

    return {
        get: get
    };
}

module.exports = Proxy();

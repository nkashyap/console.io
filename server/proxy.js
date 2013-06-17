/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 15/06/13
 * Time: 15:43
 * To change this template use File | Settings | File Templates.
 */

function Proxy() {
    var url = require('url'),
        request = require('request');

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
            imageUrl = query.url || null,
            callback = query.callback || null;

        console.log('Proxy', imageUrl);

        // check for param existance, error if not
        if (!imageUrl || !callback) {
            console.log('Missing arguments');
            res.writeHead(400); // 400 = Bad Request
            res.end();
            return false;
        }

        // request the image url
        request({
            url: imageUrl,
            method: 'GET',
            encoding: 'base64',
            timeout: 60 * 1000
        }, function (err, imageRes, imageData) {
            var responseData, imageContentType;

            if (!err && imageRes && imageRes.statusCode === 200) {
                res.setHeader('Content-Type', 'application/javascript');
                imageContentType = imageRes.headers['content-type'];
                responseData = 'data:' + imageContentType + ';base64,' + imageData;
                res.write(callback + '(' + JSON.stringify(responseData) + ')');
                res.end();

                console.log('Sent image:', imageUrl);
                return true;
            }
            else {
                console.log('Failed image:', imageUrl);

                res.writeHead(imageRes && imageRes.statusCode || 400); // bad request
                responseData = JSON.stringify('error:Application error');
                res.write(callback + '(' + responseData + ')');
                res.end();
                return false;
            }
        });
    }

    return {
        get: get
    };
}

module.exports = Proxy();

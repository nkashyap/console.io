/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 15/06/13
 * Time: 15:43
 * To change this template use File | Settings | File Templates.
 */

function Proxy() {
    var fs = require('fs'),
        url = require('url'),
        http = require('http'),
        https = require('https');

    function get(request, response) {
        var proxyUrl = url.parse(request.param('url')),
            requestType = proxyUrl.protocol === "https:" ? https : http,
            proxyRequest;

        console.log('Proxy', proxyUrl.href);

        proxyRequest = requestType.request(proxyUrl, function (proxyResponse) {
            var headers = proxyResponse.headers;

            Object.getOwnPropertyNames(headers).forEach(function (header) {
                if (['server', 'cache-control'].indexOf(header) === -1) {
                    response.header(header, headers[header]);
                }
            });

            response.header('Access-Control-Allow-Origin', '*');
            response.header('Access-Control-Allow-Headers', 'X-Requested-With');

            proxyResponse.on('data', function (chunk) {
                response.write(chunk);
            });

            proxyResponse.on('end', function () {
                response.end();
            });
        });

        proxyRequest.on('error', function (e) {
            console.log('An error occured: ' + e.message);
            response.writeHead(503);
            response.end();
        });

        proxyRequest.end();
    }

    return {
        get: get
    };
}

module.exports = Proxy();

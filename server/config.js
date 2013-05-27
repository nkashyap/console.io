/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 10/04/13
 * Time: 21:38
 * To change this template use File | Settings | File Templates.
 */

module.exports = {
    express: {
        development: {
            set: [
                { 'title': 'Console.IO Dev' },
                { 'port-number': 8082 },
                { 'secret-key': 'console.io-dev' },
                { 'https': false }
            ]
        },
        production: {
            set: [
                { 'title': 'Console.IO' },
                { 'port-number': 8082 },
                { 'secret-key': 'console.io' },
                { 'https': false }
            ]
        }
    },
    io: {
        development: {
            enable: [],
            disable: [],
            set: [
                { 'log level': 3 }
            ]
        },
        production: {
            enable: [
                'browser client minification',
                'browser client etag',
                'browser client gzip'
            ],
            disable: [],
            set: [
                { 'transports': [
                    'websocket',
                    'htmlfile',
                    'xhr-polling',
                    'jsonp-polling'
                ]},
                { 'log level': 1 }
            ]
        }
    }
};
/**
 * ConsoleIO server configurations
 *
 * @public
 * @static
 * @name config
 *
 * @property {object}  express                  - express configuration object
 * @property {object}  express.development      - express development env configuration object
 * @property {object}  express.development.set  - express development env setters
 * @property {object}  express.production       - express production env configuration object
 * @property {object}  express.production.set   - express production env setters
 * @property {object}  https                    - express http/https configuration object
 * @property {object}  https.enable             - express
 * @property {object}  https.key                - express
 * @property {object}  https.certificate        - express
 * @property {object}  https.ca                 - express
 * @property {object}  io                       - io configuration object
 * @property {object}  io.development           - io development env configuration object
 * @property {Array}   io.development.enable    - io development enable configuration
 * @property {Array}   io.development.disable   - io development disable configuration
 * @property {object}  io.development.set       - io development env setters
 * @property {object}  io.production            - io production env configuration object
 * @property {Array}   io.production.enable     - io production enable configuration
 * @property {Array}   io.production.disable    - io production disable configuration
 * @property {object}  io.production.set        - io production env setters
 * @property {object}  redis                    - redis configuration object
 * @property {boolean} redis.enable             - true to scale console.io server
 * @property {number} redis.process             - number of process to run
 *
 * @author Nisheeth Kashyap <nisheeth.k.kashyap@gmail.com>
 */

var config = {

    /** express configurations **/
    express: {
        development: {
            set: [
                { 'title': 'Console.IO Dev' },
                { 'port-number': 8082 },
                { 'session-key': 'console.io-dev' }
            ]
        },
        production: {
            set: [
                { 'title': 'Console.IO' },
                { 'port-number': 8082 },
                { 'session-key': 'console.io' }
            ]
        }
    },

    /** https configurations **/
    https: {
        enable: false,
        //pfx: './certificates/bbdev1.pfx',
        key: './certificates/server.key',
        certificate: './certificates/server.crt',
        ca: './certificates/ca.crt'
    },

    /** socket.io configurations **/
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
    },

    /** redis configurations **/
    redis: {
        enable: true,
        process: 0
    }
};

/**
 * Export config object as module
 * @module config
 */
module.exports = config;
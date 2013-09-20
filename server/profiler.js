/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 20/09/13
 * Time: 10:19
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

function Profiler() {
    var esprima = require("esprima"),
        estraverse = require("estraverse"),
        escodegen = require("escodegen"),
        url = require('url'),
        request = require('request'),
        timeout = 60 * 1000;

    var templateAST = {
        "type": "ExpressionStatement",
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                    "type": "Identifier",
                    "name": "console"
                },
                "property": {
                    "type": "Identifier",
                    "name": "profilerStart"
                }
            },
            "arguments": [
                {
                    "type": "Literal",
                    "value": "0",
                    "raw": "'0'"
                },
                {
                    "type": "Literal",
                    "value": "anonymous",
                    "raw": "'anonymous'"
                },
                {
                    "type": "Identifier",
                    "name": "arguments"
                }
            ]
        }
    };

    function clone(item) {
        if (!item) {
            return item;
        } // null, undefined values check

        var types = [Number, String, Boolean],
            result;

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        types.forEach(function (type) {
            if (item instanceof type) {
                result = type(item);
            }
        });

        if (typeof result == "undefined") {
            if (Object.prototype.toString.call(item) === "[object Array]") {
                result = [];
                item.forEach(function (child, index, array) {
                    result[index] = clone(child);
                });
            } else if (typeof item == "object") {
                // testing that this is DOM
                if (item.nodeType && typeof item.cloneNode == "function") {
                    var result = item.cloneNode(true);
                } else if (!item.prototype) { // check that this is a literal
                    if (item instanceof Date) {
                        result = new Date(item);
                    } else {
                        // it is an object literal
                        result = {};
                        for (var i in item) {
                            result[i] = clone(item[i]);
                        }
                    }
                } else {
                    // depending what you would like here,
                    // just keep the reference, or create new object
                    if (false && item.constructor) {
                        // would not advice to do that, reason? Read below
                        result = new item.constructor();
                    } else {
                        result = item;
                    }
                }
            } else {
                result = item;
            }
        }

        return result;
    }

    var getUniqueId = (function getUniqueId() {
        var i = 0;
        return function getUniqueId() {
            return ['c', ++i].join(':');
        };
    }());

    function parse(content) {
        var originalAST = esprima.parse(content, {});

        var updatedAST = estraverse.replace(originalAST, {
            enter: function (node, parent) {

                if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
                    var copyNode = clone(node),
                        id = getUniqueId(),
                        startAST = clone(templateAST),
                        endAST = clone(templateAST),
                        startParams = startAST.expression["arguments"] = [],
                        endParams = endAST.expression["arguments"] = [],
                        param1 = { "type": "Literal", "value": id, "raw": "'" + id + "'" },
                        param2 = { "type": "Literal", "value": "anonymous", "raw": "'anonymous'" },
                        param3 = { "type": "Identifier", "name": "arguments" },
                        body, lastNode, name = [];

                    startAST.expression.callee.property.name = 'profilerStart';
                    endAST.expression.callee.property.name = 'profilerEnd';

                    switch(parent.type){
                        case 'VariableDeclarator':
                            if(parent.id.name){
                                name.push(parent.id.name);
                            }
                            break;
                        case 'AssignmentExpression':
                            if(parent.left.object.name){
                                name.push(parent.left.object.name);
                            }
                            if(parent.left.property.name){
                                name.push(parent.left.property.name);
                            }
                            break;
                        case 'LogicalExpression':
                            if(parent.left.object.name){
                                name.push(parent.left.object.name);
                            }
                            if(parent.left.property.name){
                                name.push(parent.left.property.name);
                            }
                            break;
                        case 'Property':
                            if(parent.key.name){
                                name.push(parent.key.name);
                            }
                            break;
//                        case 'BlockStatement':
//                            break;
//                        case 'CallExpression':
//                            break;
//                        case 'ReturnStatement':
//                            break;
                        default:
                            //console.log(parent.type, node.id);
                    }

                    if (node.id && node.id.name) {
                        if(name.indexOf(node.id.name) === -1){
                            name.push(node.id.name);
                        }
                    }

                    if(name.length > 0){
                        param2.value = name.join('.');
                        param2.raw = "'" + name.join('.') + "'";
                    }

                    startParams.push(param1, param2, param3);
                    endParams.push(param1, param2, param3);

                    body = [startAST].concat(copyNode.body.body, [endAST]);
                    lastNode = copyNode.body.body.pop();
                    if(lastNode){
                        if (lastNode.type === 'ReturnStatement') {
                            body = [startAST].concat(copyNode.body.body, [endAST, lastNode]);
                        }
                    }

                    copyNode.pid = id;
                    copyNode.body.body = body;
                    return copyNode;
                }
            },
            leave: function (node, parent) {}
        });

        return escodegen.generate(updatedAST);
    }

    function get(req, res) {
        // Get the params
        var query = url.parse(req.url, true).query,
            uri = query.url || null,
            opt = {};

        console.log('profiler request:', uri);

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
                res.setHeader('Content-Type', proxyRes.headers['content-type']);
                res.write(parse(proxyData));

                //console.log('sent:', uri);
            } else {
                // bad request
                res.writeHead(proxyRes.statusCode || 400);
                //console.log('failed:', uri);
            }

            res.end();
        }

        // set request options
        opt.url = uri;
        opt.method = 'GET';
        opt.timeout = timeout;

        // make a request
        request(opt, proxyCallback);
    }

    return {
        get: get
    };
}

module.exports = Profiler();
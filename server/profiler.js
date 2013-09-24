/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 20/09/13
 * Time: 10:19
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * Profiler proxy
 */

function Profiler() {
    var esprima = require("esprima"),
        estraverse = require("estraverse"),
        escodegen = require("escodegen"),
        url = require('url'),
        request = require('request'),
        timeout = 60 * 1000,
        templateAST,
        getUniqueId;

    templateAST = {
        "type": "ExpressionStatement",
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                    "type": "Identifier",
                    "name": "__p__"
                },
                "property": {
                    "type": "Identifier",
                    "name": ""
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
                    "type": "Literal",
                    "value": "",
                    "raw": "''"
                },
                {
                    "type": "Literal",
                    "value": "0",
                    "raw": "'0'"
                }
            ]
        }
    };

    getUniqueId = (function () {
        var i = 1000;
        return function () {
            return i++;
        };
    }());

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

    function parse(uri, content) {
        try {
            return appendFns(esprima.parse(content, {
                loc: true,
                comment: true,
                raw: true
            }), uri);
        } catch (e) {
            console.error(e, uri);
        }
    }

    function appendFns(ast, uri) {
        try {
            return parseAST(estraverse.replace(ast, {
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
                            param3 = { "type": "Literal", "value": uri, "raw": "'" + uri + "'" },
                            param4 = { "type": "Literal", "value": 0, "raw": '0' },
                            body, lastNode, name = [];

                        startAST.expression.callee.property.name = 'b';
                        endAST.expression.callee.property.name = 'e';

                        switch (parent.type) {
                            case 'VariableDeclarator':
                                if (parent.id && parent.id.name) {
                                    name.push(parent.id.name);
                                }
                                break;
                            case 'AssignmentExpression':
                            case 'LogicalExpression':
                            case 'MemberExpression':
                                if(parent.left){
                                    if (parent.left.object && parent.left.object.name) {
                                        name.push(parent.left.object.name);
                                    }
                                    if (parent.left.property && parent.left.property.name) {
                                        name.push(parent.left.property.name);
                                    }
                                }
                                break;
                            case 'Property':
                                if (parent.key.name) {
                                    name.push(parent.key.name);
                                }
                                break;
//                                    case 'BlockStatement':
//                                        break;
//                                    case 'CallExpression':
//                                        break;
//                                    case 'ReturnStatement':
//                                        break;
                            default:
                            //console.log(parent.type, node.id);
                        }

                        if (node.id) {
                            if (node.id.name) {
                                if (name.indexOf(node.id.name) === -1) {
                                    name.push(node.id.name);
                                }
                            }
                        }

                        var loc = node.loc || node.id.loc;
                        if (loc) {
                            param4 = {
                                "type": "Literal",
                                "value": loc.start.line,
                                "raw": loc.start.line };
                        }

                        if (name.length > 0) {
                            param2.value = name.join('.');
                            param2.raw = "'" + name.join('.') + "'";
                        }

                        startParams.push(param1, param2, param3, param4);
                        endParams.push(param1);

                        body = [startAST].concat(copyNode.body.body, [endAST]);
                        lastNode = copyNode.body.body.pop();
                        if (lastNode) {
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
            }), uri);
        } catch (e) {
            console.error(e, uri);
        }
    }

    function parseAST(ast, uri) {
        try {
            return escodegen.generate(ast, {
                comment: true
            });
        } catch (e) {
            console.error(e, uri);
        }
    }

    function get(req, res) {
        var query = url.parse(req.url, true).query,
            uri = query.url || null,
            opt = {};

        console.log('profiler request:', uri);

        if (!uri) {
            console.log('URL missing!!');
            res.writeHead(400);
            res.end();
            return false;
        }

        function proxyCallback(err, proxyRes, proxyData) {
            proxyRes = proxyRes || {};
            if (!err && proxyRes.statusCode === 200) {
                res.setHeader('Content-Type', proxyRes.headers['content-type']);

                if (uri.indexOf('.css') > -1 || uri.indexOf('.html') > -1) {
                    res.write(proxyData);
                } else {
                    res.write(parse(uri, proxyData));
                }
            } else {
                res.writeHead(proxyRes.statusCode || 400);
            }

            res.end();
        }

        opt.url = uri;
        opt.method = 'GET';
        opt.timeout = timeout;

        request(opt, proxyCallback);
    }

    return {
        get: get
    };
}

module.exports = Profiler();
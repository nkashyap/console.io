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
        request = require('request');

    var getUniqueId = (function () {
        var i = 1000;
        return function () {
            return i++;
        };
    }());

    var VariableDeclaration = {
        "type": "VariableDeclaration",
        "kind": "var",
        "declarations": []
    };

    var VariableDeclarator = {
        "type": "VariableDeclarator",
        "id": {},
        "init": {}
    };

    var Identifier = {
        "type": "Identifier",
        "name": ""
    };

    var Literal = {
        "type": "Literal",
        "value": "",
        "raw": "''"
    };

    var Property = {
        "type": "Property",
        "key": {},
        "value": {},
        "kind": "init"
    };

    var ObjectExpression = {
        "type": "ObjectExpression",
        "properties": []
    };

    var CallExpression = {
        "type": "CallExpression",
        "callee": {},
        "arguments": []
    };

    var ArrayExpression = {
        "type": "ArrayExpression",
        "elements": []
    };

    var MemberExpression = {
        "type": "MemberExpression",
        "computed": false,
        "object": {},
        "property": {}
    };

    var ExpressionStatement = {
        "type": "ExpressionStatement",
        "expression": {}
    };


    function buildDateAST() {
        var callExp = clone(CallExpression),
            memberExp = clone(MemberExpression),
            objectIdentifier = clone(Identifier),
            propertyIdentifier = clone(Identifier);

        objectIdentifier.name = "Date";
        propertyIdentifier.name = "now";

        memberExp.object = objectIdentifier;
        memberExp.property = propertyIdentifier;

        callExp.callee = memberExp;

        return callExp;
    }

    function buildBeginAST(id, reset) {
        var expression = clone(ExpressionStatement),
            callExp = clone(CallExpression),
            memberExp = clone(MemberExpression),
            objectIdentifier = clone(Identifier),
            propertyIdentifier = clone(Identifier),
            argIdentifier = clone(Identifier),
            idLiteral = clone(Literal),
            resetLiteral = clone(Literal);

        idLiteral.value = idLiteral.raw = id;
        resetLiteral.value = true;
        resetLiteral.raw = "true";

        objectIdentifier.name = "window";
        propertyIdentifier.name = "__pb";

        memberExp.object = objectIdentifier;
        memberExp.property = propertyIdentifier;

        argIdentifier.name = "arguments";

        callExp.callee = memberExp;
        callExp["arguments"] = [];
        callExp["arguments"].push(idLiteral);
        callExp["arguments"].push(argIdentifier);
        callExp["arguments"].push(buildDateAST());

        if (reset) {
            callExp["arguments"].push(resetLiteral);
        }

        expression.expression = callExp;

        return expression;
    }

    function buildEndAST(id) {
        var expression = clone(ExpressionStatement),
            callExp = clone(CallExpression),
            memberExp = clone(MemberExpression),
            objectIdentifier = clone(Identifier),
            propertyIdentifier = clone(Identifier),
            idLiteral = clone(Literal);

        idLiteral.value = idLiteral.raw = id;

        objectIdentifier.name = "window";
        propertyIdentifier.name = "__pe";

        memberExp.object = objectIdentifier;
        memberExp.property = propertyIdentifier;

        callExp.callee = memberExp;
        callExp["arguments"] = [idLiteral, buildDateAST()];

        expression.expression = callExp;

        return expression;
    }

    function buildUrlAST(uri) {
        var urlLiteral = clone(Literal);
        urlLiteral.value = uri;
        urlLiteral.raw = "'" + uri + "'";
        return urlLiteral;
    }

    function buildValueAST(name, line) {
        var arrarExp = clone(ArrayExpression),
            nameLiteral = clone(Literal),
            lineLiteral = clone(Literal);

        nameLiteral.value = name;
        nameLiteral.raw = "'" + name + "'";
        lineLiteral.value = lineLiteral.raw = line;

        arrarExp.elements.push(nameLiteral);
        arrarExp.elements.push(lineLiteral);

        return arrarExp;
    }

    function buildPropertyAST(id, name, line) {
        var property = clone(Property),
            keyLiteral = clone(Literal);

        keyLiteral.value = keyLiteral.raw = id;

        property.key = keyLiteral;
        property.value = buildValueAST(name, line);

        return property;
    }

    function buildArgumentObjectAST(exp, fileAST) {
        var objectExp = clone(ObjectExpression);
        exp.expression["arguments"] = [fileAST, objectExp];
        return objectExp;
    }

    function buildLoadAST() {
        var expression = clone(ExpressionStatement),
            callExp = clone(CallExpression),
            memberExp = clone(MemberExpression),
            objectIdentifier = clone(Identifier),
            propertyIdentifier = clone(Identifier);

        objectIdentifier.name = "window";
        propertyIdentifier.name = "__pd";

        memberExp.object = objectIdentifier;
        memberExp.property = propertyIdentifier;

        callExp.callee = memberExp;
        expression.expression = callExp;

        return expression;
    }

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

    function getFunctionName(parent) {
        var name = [];
        switch (parent.type) {
            case 'VariableDeclarator':
            case 'FunctionExpression':
                if (parent.id) {
                    name = name.concat(getFunctionName(parent.id));
                }
                break;
            case 'AssignmentExpression':
            case 'LogicalExpression':
            case 'MemberExpression':
                if (parent.left) {
                    if (parent.left.object && parent.left.property) {
                        name = name.concat(getFunctionName(parent.left.object));
                        name = name.concat(getFunctionName(parent.left.property));
                    } else {
                        name = name.concat(getFunctionName(parent.left));
                    }

                } else if (parent.object && parent.property) {
                    name = name.concat(getFunctionName(parent.object));
                    name = name.concat(getFunctionName(parent.property));
                }
                break;
            case 'Property':
                if (parent.key) {
                    name = name.concat(getFunctionName(parent.key));
                }
                break;
            case 'CallExpression':
                if (parent.callee) {
                    name = name.concat(getFunctionName(parent.callee));
                }
                break;
            case 'Identifier':
                if (parent.name) {
                    name.push(parent.name);
                }
                break;
            case 'BlockStatement':
            case 'ReturnStatement':
            case 'ArrayExpression':
            case 'ConditionalExpression':
            case 'Program':
            case 'Literal':
            case 'ThisExpression':
                break;
            default:
                console.log(parent.type);
                break;
        }

        return name;
    }

    function appendFns(ast, uri) {
        try {
            var loadAST = buildLoadAST(),
                argument = buildArgumentObjectAST(loadAST, buildUrlAST(uri));

            return parseAST(estraverse.replace(ast, {
                enter: function (node, parent) {
                    if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
                        var copyNode = clone(node),
                            id = getUniqueId(),
                            startAST, endAST, lineNo = 0, fullName = "anonymous",
                            body,
                            lastNode,
                            name = getFunctionName(parent);

                        if (node.id) {
                            if (node.id.name) {
                                if (name.indexOf(node.id.name) === -1) {
                                    name.push(node.id.name);
                                }
                            }
                        }

                        if(node.loc || node.id.loc){
                            lineNo = (node.loc || node.id.loc).start.line;
                        }

                        if(name.length > 0){
                            fullName = name.join('.');
                        }

                        copyNode.body.body.forEach(function (exp) {
                            switch (exp.type) {
                                case 'ExpressionStatement':
                                    if (exp.expression.callee && exp.expression.callee.name &&
                                        (exp.expression.callee.name === 'setTimeout' || exp.expression.callee.name === 'setInterval')) {
                                        exp.expression.parentId = id;
                                    }
                                    break;
                                default:
                            }
                        });

                        startAST = buildBeginAST(id, !!parent.parentId);
                        endAST = buildEndAST(id);
                        argument.properties.push(buildPropertyAST(id, fullName, lineNo));

                        body = [startAST].concat(copyNode.body.body, [endAST]);
                        lastNode = copyNode.body.body.pop();
                        if (lastNode) {
                            if (lastNode.type === 'ReturnStatement') {
                                body = [startAST].concat(copyNode.body.body, [endAST, lastNode]);
                            }
                        }

                        copyNode.body.body = body;
                        return copyNode;

                    }
                },
                leave: function (node, parent) {
                    if (node.type === 'Program') {
                        node.body.push(loadAST);
                    }
                }
            }), uri);
        } catch (e) {
            console.error(e, uri);
        }
    }

    function parseAST(ast, uri) {
        try {
            return escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '    ',
                        base: 0
                    },
                    json: false,
                    renumber: false,
                    hexadecimal: false,
                    quotes: 'single',
                    escapeless: false,
                    compact: false,
                    parentheses: true,
                    semicolons: true
                },
                parse: null,
                comment: true,
                //verbatim: undefined,
                //sourceMap: undefined,
                sourceMapRoot: null,
                sourceMapWithCode: false,
                directive: false
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
        opt.timeout = 60 * 1000;

        request(opt, proxyCallback);
    }

    return {
        get: get
    };
}

module.exports = Profiler();
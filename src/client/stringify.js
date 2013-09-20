/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 11:00
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * Stringify
 */

(function (exports, global) {

    var stringify = exports.stringify = {};

    stringify.objects = [
        'Arguments', 'Array', 'String', 'Number', 'Boolean',
        'Function', 'Object', 'Geoposition', 'Coordinates', 'CRuntimeObject'
    ];

    stringify.events = [
        'Event', 'KeyboardEvent', 'MouseEvent', 'TouchEvent',
        'WheelEvent', 'UIEvent', 'CustomEvent', 'NotifyAudioAvailableEvent',
        'CompositionEvent', 'CloseEvent', 'MessageEvent', 'MessageEvent',
        'XMLHttpRequestProgressEvent', 'ProgressEvent'
    ];

    stringify.errors = [
        'Error', 'ErrorEvent', 'DOMException', 'PositionError'
    ];

    stringify.parse = function parse(data, level, simple) {
        var value = '',
            type = exports.util.getType(data);

        simple = typeof simple === 'undefined' ? true : simple;
        level = level || 1;

        if (stringify.objects.indexOf(type) > -1 || stringify.events.indexOf(type) > -1 || stringify.errors.indexOf(type) > -1) {
            /* jshint -W086 */
            switch (type) {
                case 'Error':
                case 'ErrorEvent':
                    data = data.message;
                case 'String':
                    value = stringify.parseString(data);
                    break;

                case 'Arguments':
                    data = exports.util.toArray(data);
                case 'Array':
                    value = stringify.parseArray(data, level);
                    break;

                case 'Number':
                    value = String(data);
                    break;

                case 'Boolean':
                    value = data ? 'true' : 'false';
                    break;

                case 'Function':
                    value = '"' + exports.util.getFunctionName(data) + '"';
                    break;

                default:
                    value = stringify.parseObject(type, data, level);
                    break;
            }
            /* jshint +W086 */
        } else if (data === null) {
            value = '"null"';

        } else if (data === undefined) {
            value = '"undefined"';

        } else if (simple) {
            value = stringify.parseObject(type, data, level);

        } else {
            try {
                value = String(data);
            } catch (e) {
                exports.console.error(e);
            }
        }

        return value;
    };

    stringify.valueOf = function valueOf(data, skipGlobal, level) {
        var type = exports.util.getType(data);

        if ((stringify.objects.indexOf(type) > -1 || stringify.events.indexOf(type) > -1 || stringify.errors.indexOf(type) > -1) && !skipGlobal) {
            return this.parse(data, level);
        } else {
            if (type === 'Function') {
                type = '[Function ' + exports.util.getFunctionName(data) + ']';
            } else if (data && data.constructor && data.constructor.name) {
                type = '[object ' + data.constructor.name + ']';
            }

            return type;
        }
    };

    stringify.parseString = function parseString(data) {
        return '"' + data.replace(/"/g, '\'').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '"';
    };

    stringify.parseArray = function parseArray(data, level) {
        var target = [], txt;
        exports.util.forEach(data, function (item, index) {
            this[index] = stringify.valueOf(item, false, level);
        }, target);

        if (target.length > 0) {
            txt = '[ ' + target.join(', ') + ' ]';
        } else {
            txt = '[ ' + data.toString() + ' ]';
        }

        return txt;
    };

    stringify.parseObject = function parseObject(type, data, level) {
        var name = '',
            skipGlobal = type === '[object global]',
            tabAfter = (new Array(level)).join('\t'),
            tabBefore = (new Array(++level)).join('\t'),
            target = [], txt;

        if (data && data.constructor) {
            name = data.constructor.name;
        }

        exports.util.forEachProperty(data, function (value, property) {
            this.push(tabBefore + '"' + property + '": ' + stringify.valueOf(value, skipGlobal, level));
        }, target);

        if (target.length > 0) {
            txt = (name || type) + ': {\n' + target.join(',\n') + '\n' + tabAfter + '}';
        } else {
            txt = data.toString() + '\n';
        }

        return txt;
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
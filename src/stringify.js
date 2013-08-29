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
        '[object Arguments]', '[object Array]',
        '[object String]', '[object Number]', '[object Boolean]',
        '[object Function]', '[object Object]', '[object Geoposition]', '[object Coordinates]',
        '[object CRuntimeObject]'
    ];

    stringify.events = [
        '[object Event]', '[object KeyboardEvent]', '[object MouseEvent]', '[object TouchEvent]',
        '[object WheelEvent]', '[object UIEvent]', '[object CustomEvent]', '[object NotifyAudioAvailableEvent]',
        '[object CompositionEvent]', '[object CloseEvent]', '[object MessageEvent]', '[object MessageEvent]'
    ];

    stringify.errors = [
        '[object Error]', '[object ErrorEvent]', '[object DOMException]',
        '[object PositionError]'
    ];

    stringify.parse = function parse(data, level, simple) {
        var value = '',
            type = exports.util.getObjectType(data);

        simple = typeof simple === 'undefined' ? true : simple;
        level = level || 1;

        if (stringify.objects.indexOf(type) > -1 || stringify.events.indexOf(type) > -1 || stringify.errors.indexOf(type) > -1) {
            switch (type) {
                case '[object Error]':
                case '[object ErrorEvent]':
                    data = data.message;
                case '[object String]':
                    value = stringify.parseString(data);
                    break;

                case '[object Arguments]':
                    data = exports.util.toArray(data);
                case '[object Array]':
                    value = stringify.parseArray(data, level);
                    break;

                case '[object Number]':
                    value = String(data);
                    break;

                case '[object Boolean]':
                    value = data ? 'true' : 'false';
                    break;

                case '[object Function]':
                    value = '"' + exports.util.getFunctionName(data) + '"';
                    break;

                default:
                    value = stringify.parseObject(type, data, level);
                    break;
            }
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
        var type = exports.util.getObjectType(data);

        if ((stringify.objects.indexOf(type) > -1 || stringify.events.indexOf(type) > -1 || stringify.errors.indexOf(type) > -1) && !skipGlobal) {
            return this.parse(data, level);
        } else {
            if (type === '[object Function]') {
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
        var target = [];
        exports.util.forEach(data, function (item, index) {
            this[index] = stringify.valueOf(item, false, level);
        }, target);

        if (target.length > 0) {
            return '[ ' + target.join(', ') + ' ]';
        } else {
            return '[ ' + data.toString() + ' ]';
        }
    };

    stringify.parseObject = function parseObject(type, data, level) {
        var name = '',
            skipGlobal = type === '[object global]',
            tabAfter = (new Array(level)).join('\t'),
            tabBefore = (new Array(++level)).join('\t'),
            target = [];

        if (data && data.constructor) {
            name = data.constructor.name;
        }

        exports.util.forEachProperty(data, function (value, property) {
            this.push(tabBefore + '"' + property + '": ' + stringify.valueOf(value, skipGlobal, level));
        }, target);

        if (target.length > 0) {
            return (name || type) + ': {\n' + target.join(',\n') + '\n' + tabAfter + '}';
        } else {
            return data.toString() + '\n';
        }
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
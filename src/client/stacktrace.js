/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 10:30
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * StackTrace
 */

(function (exports, global) {

    var stacktrace = exports.stacktrace = {};

    function getFormatter(e) {
        if (e['arguments'] && e.stack) {
            return exports.formatter.chrome;

        } else if (e.stack && e.sourceURL) {
            return exports.formatter.safari;

        } else if (e.stack && e.number) {
            return exports.formatter.ie;

        } else if (typeof e.message === 'string' && typeof window !== 'undefined' && window.opera) {
            if (!e.stacktrace) {
                return exports.formatter.opera9;
            }

            if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                return exports.formatter.opera9;
            }

            if (!e.stack) {
                return exports.formatter.opera10a;
            }

            if (e.stacktrace.indexOf("called from line") < 0) {
                return exports.formatter.opera10b;
            }

            return exports.formatter.opera11;

        } else if (e.stack) {
            return exports.formatter.firefox;
        }

        return 'other';
    }

    stacktrace.allowedErrorStackLookUp = ['Error', 'ErrorEvent', 'DOMException', 'PositionError'];

    stacktrace.create = function create(message) {
        try {
            //undefined();
            throw new Error(message);
        } catch (e) {
            // remove error string from stack
            e.stack = e.stack.replace("Error: ", "");
            return e;
        }
    };

    stacktrace.get = function get(e) {
        var formatterFn = getFormatter(e);
        if (typeof formatterFn === 'function') {
            return formatterFn(e);
        } else {
            var errorClass = exports.util.getType(e);
            if (stacktrace.allowedErrorStackLookUp.indexOf(errorClass) === -1) {
                return errorClass + ' is missing from "stacktrace.allowedErrorStackLookUp[' + stacktrace.allowedErrorStackLookUp.join(',') + ']";';
            }

            return exports.formatter.other(arguments.callee);
        }
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 10/04/13
 * Time: 21:38
 * To change this template use File | Settings | File Templates.
 */

var ROOT = __dirname + '/../',
    fs = require('fs'),
    path = require('path'),
    UglifyJS = require('uglify-js'),
    beautify = require('js-beautify');

var Utils = {
    fileCache: {},

    getFile: function getFile(loc, config, file) {
        var filePath;

        if (fs.existsSync(ROOT + loc.join("/"))) {
            var versionPath = ROOT + loc.concat([config.version, file]).join("/"),
                defaultPath = ROOT + loc.concat(['_default_', file]).join("/");

            if (fs.existsSync(versionPath)) {
                filePath = versionPath;
            } else if (fs.existsSync(defaultPath)) {
                filePath = defaultPath;
            }
        }

        return filePath;
    },

    getDeviceScript: function getDeviceScript(basePath, config, file) {
        var loc;

        loc = this.getFile([basePath, config.manufacture, config.platform, config.browser], config, file);

        if (!loc) {
            loc = this.getFile([basePath, config.manufacture, config.browser], config, file);
        }

        if (!loc) {
            loc = this.getFile([basePath, config.browser], config, file);
        }

        if (!loc) {
            loc = this.getFile([basePath], { version: '____' }, file);
        }

        return loc;
    },

    getScript: function getScript(basePath, config, fileName) {
        var checkpoint, content,
            file = this.getDeviceScript(basePath, config, fileName);

        if (!file) {
            return false;
        }

        if (process.env.NODE_ENV === 'production') {
            content = this.fileCache[file];
        }

        checkpoint = fs.statSync(file);

        if (!content || (content && content.checkpoint.mtime !== checkpoint.mtime)) {
            this.fileCache[file] = content = UglifyJS.minify(file);
            this.fileCache[file].checkpoint = checkpoint;
        }

        return content.code.indexOf('!') === 0 ? content.code.substring(1, content.code.length) : content.code;
    },

    getContent: function getContent(content, type) {
        switch (type) {
            case 'css':
                content = beautify.css_beautify(content, {
                    "indent_size": 4,
                    "indent_char": " "
                });
                break;
            case 'js':
                content = beautify.js_beautify(content, {
                    "indent_size": 4,
                    "indent_char": " ",
                    "indent_level": 0,
                    "indent_with_tabs": false,
                    "preserve_newlines": true,
                    "max_preserve_newlines": 5,
                    "jslint_happy": false,
                    "brace_style": "collapse",
                    "keep_array_indentation": false,
                    "keep_function_indentation": false,
                    "space_before_conditional": true,
                    "break_chained_methods": false,
                    "eval_code": false,
                    "unescape_strings": false,
                    "wrap_line_length": 0
                });

                break;
            default:
                content = beautify.html_beautify(content, {
                    "indent_inner_html": true,
                    "indent_size": 4,
                    "indent_char": " ",
                    "brace_style": "collapse",
                    "indent_scripts": "normal",
                    "wrap_line_length": 0,
                    "preserve_newlines": true,
                    "max_preserve_newlines": 10
                });
                break;
        }

        console.log('Content beautify as ' + type);
        return content;
    },

    readdir: function readdir(loc, successCallback, errorCallback, scope) {
        var basepath = path.normalize(ROOT + (loc || ''));
        console.info('readdir', basepath);
        fs.readdir(basepath, function callback(err, files) {
            console.info('readdir:success', basepath, !err);
            if (err) {
                errorCallback.call(scope, err);
            } else {
                successCallback.call(scope, files);
            }
        });
    },

    readFile: function readFile(loc, name, successCallback, errorCallback, scope) {
        var basepath = path.normalize(ROOT + (loc || '') + name);
        console.info('readFile', basepath);
        fs.readFile(basepath, 'utf8', function callback(err, content) {
            console.info('readFile:success', basepath, !err);
            if (err) {
                errorCallback.call(scope, err);
            } else {
                successCallback.call(scope, content);
            }
        });
    },

    writeFile: function writeFile(loc, name, content, successCallback, errorCallback, scope) {
        var basepath = path.normalize(ROOT + (loc || '') + name);
        console.info('writeFile', basepath);
        fs.writeFile(basepath, content, function callback(err) {
            console.info('writeFile:success', basepath, !err);
            if (err) {
                errorCallback.call(scope, err);
            } else {
                successCallback.call(scope);
            }
        });
    }
};

module.exports = Utils;
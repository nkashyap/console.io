/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 10/04/13
 * Time: 21:38
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs'),
    UglifyJS = require('uglify-js'),
    beautify = require('js-beautify');

var Utils = {
    fileCache: {},

    getFile: function getFile(path, config, file) {
        var filePath;

        if (fs.existsSync(path.join("/"))) {
            var versionPath = path.concat([config.version, file]).join("/"),
                defaultPath = path.concat(['_default_', file]).join("/");

            if (fs.existsSync(versionPath)) {
                filePath = versionPath;
            } else if (fs.existsSync(defaultPath)) {
                filePath = defaultPath;
            }
        }

        return filePath;
    },

    getDeviceScript: function getDeviceScript(basePath, config, file) {
        var path;

        path = this.getFile([basePath, config.manufacture, config.platform, config.browser], config, file);

        if (!path) {
            path = this.getFile([basePath, config.manufacture, config.browser], config, file);
        }

        if (!path) {
            path = this.getFile([basePath, config.browser], config, file);
        }

        if (!path) {
            path = this.getFile([basePath], { version: '____' }, file);
        }

        return path;
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
                    "max_preserve_newlines": 10,
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
    }
};

module.exports = Utils;
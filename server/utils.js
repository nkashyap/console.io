/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 10/04/13
 * Time: 21:38
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs'),
    UglifyJS = require('uglify-js');

var Utils = {
    fileCache: {},

    getFile: function getFile(basePath, config, file) {
        var filePath = null,
            path = [basePath, config.browser];

        if (fs.existsSync(path.join("/"))) {
            var versionPath = path.concat([config.version, file]).join("/"),
                defaultPath = path.concat(['_default_', file]).join("/");

            if (fs.existsSync(versionPath)) {
                filePath = versionPath;
            } else if (fs.existsSync(defaultPath)) {
                filePath = defaultPath;
            }
        }

        if (!filePath) {
            var globalPath = [basePath, '_default_', file].join("/");
            if (fs.existsSync(globalPath)) {
                filePath = globalPath;
            }
        }

        return filePath;
    },

    getScript: function getScript(basePath, config, fileName) {
        var checkpoint, content,
            file = this.getFile(basePath, config, fileName);

        if (!file) {
            return false;
        }

        content = this.fileCache[file];
        checkpoint = fs.statSync(file);

        if (!content || (content && content.checkpoint.mtime !== checkpoint.mtime)) {
            this.fileCache[file] = content = UglifyJS.minify(file);
            this.fileCache[file].checkpoint = checkpoint;
        }

        return content.code.indexOf('!') === 0 ? content.code.substring(1, content.code.length) : content.code;
    }
};

module.exports = Utils;
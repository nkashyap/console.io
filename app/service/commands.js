/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 18/05/13
 * Time: 20:45
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.Service.Commands");

ConsoleIO.Service.Commands = {
    listFiles: function listFiles(device) {
        console.log('listFiles', device);

        ConsoleIO.Service.Socket.emit('deviceFiles', {
            name: name,
            script: " (function(){" +
                "     var i, files = { javascript: [], css: [] }, " +
                "       scripts = document.scripts, scriptLength = scripts.length;" +
                "       styles = document.getElementsByTagName('link'), stylesLength = styles.length;" +
                "     for(i = 0; i < scriptLength; i++){" +
                "         files.javascript.push(scripts[i].src);" +
                "     };" +
                "     for(i = 0; i < stylesLength; i++){" +
                "         files.css.push(styles[i].href);" +
                "     };" +
                "   return files;" +
                "}())"
        });
    },
    viewFile: function viewFile(device, url) {
        console.log('viewFile', device, url);
    }
};
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Explorer");

ConsoleIO.App.Device.Explorer = function ExplorerController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.store = {
        folder: [],
        files: []
    };
    this.nodes = {
        processing: false,
        opened: []
    };

    this.view = new ConsoleIO.View.Device.Explorer(this, this.model);
    ConsoleIO.Service.Socket.on('device:files:' + this.model.serialNumber, this.add, this);
    ConsoleIO.Service.Socket.on('device:download:' + this.model.serialNumber, this.download, this);
};


ConsoleIO.App.Device.Explorer.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.serialNumber, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Device.Explorer.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:files:' + this.model.serialNumber, this.add, this);
    ConsoleIO.Service.Socket.off('device:download:' + this.model.serialNumber, this.download, this);
    this.clear();
    this.view = this.view.destroy();
};


ConsoleIO.App.Device.Explorer.prototype.add = function add(data) {
    ConsoleIO.forEach(data.files, function (file) {
        file = file.split('?')[0];

        var regex = new RegExp("((http|https)://)?([^/]+)", 'img'),
            path = file.match(regex);

        ConsoleIO.forEach(path, function (name) {
            var isJSFile = name.indexOf('.js') > -1,
                isCSSFile = name.indexOf('.css') > -1,
                isHttpFile = name.indexOf('http') > -1,
                parentId = this.getParentId(path, name),
                id = parentId ? parentId + '|' + name : name;

            if (isJSFile || isCSSFile) {
                if (this.store.files.indexOf(id) === -1) {
                    this.store.files.push(id);
                    this.view.add(id, name, parentId, ConsoleIO.Constant.ICONS[isJSFile ? 'JAVASCRIPT' : isCSSFile ? 'STYLESHEET' : 'FILE']);
                }
            } else {
                if (this.store.folder.indexOf(id) === -1) {
                    this.store.folder.push(id);

                    this.view.add(id, name, parentId, ConsoleIO.Constant.ICONS[isHttpFile ? 'WEB' : 'FOLDEROPEN']);
                }
            }
        }, this);

    }, this);

    this.nodes.processing = true;
    ConsoleIO.forEach(this.store.folder, function (id) {
        if (this.nodes.opened.indexOf(id) === -1) {
            this.view.closeItem(id);
        }
    }, this);

    ConsoleIO.async(function () {
        this.nodes.processing = false;
    }, this);
};

ConsoleIO.App.Device.Explorer.prototype.download = function download(data) {
    if (!this.exportFrame) {
        this.exportFrame = ConsoleIO.Service.DHTMLXHelper.createElement({
            tag: 'iframe',
            target: document.body
        });
    }

    this.exportFrame.src = data.file;
};

ConsoleIO.App.Device.Explorer.prototype.clear = function clear() {
    ConsoleIO.forEach(this.store.folder, function (folder) {
        this.deleteItem(folder);
    }, this.view);

    ConsoleIO.forEach(this.store.files, function (file) {
        this.deleteItem(file);
    }, this.view);

    this.store = {
        folder: [],
        files: []
    };
};

ConsoleIO.App.Device.Explorer.prototype.refresh = function refresh() {
    this.clear();

    ConsoleIO.Service.Socket.emit('reloadFiles', {
        serialNumber: this.model.serialNumber
    });
};

ConsoleIO.App.Device.Explorer.prototype.exports = function exports() {
    var nodeId = this.view.getSelectedId();

    if(this.store.folder.indexOf(nodeId) > -1){
        alert('Please select a file to download');
        return false;
    }

    if(this.store.files.indexOf(nodeId) > -1){
        ConsoleIO.Service.Socket.emit('fileSource', {
            serialNumber: this.model.serialNumber,
            saveFile: true,
            url: (nodeId.indexOf("http") === -1 ? '/' : '') + nodeId.replace(/[|]/igm, "/")
        });
    }
};


ConsoleIO.App.Device.Explorer.prototype.getParentId = function getParentId(list, item) {
    var index = list.indexOf(item);
    if (index > 0) {
        return (list.slice(0, index)).join('|');
    }
    return 0;
};


ConsoleIO.App.Device.Explorer.prototype.onButtonClick = function onButtonClick(btnId) {
    if (btnId === 'refresh') {
        this.refresh();
    }
    switch(btnId){
        case 'refresh': this.refresh();
                        break;
        case 'export': this.exports();
                        break;
    }
};

ConsoleIO.App.Device.Explorer.prototype.onDblClick = function onDblClick(btnId) {
    ConsoleIO.Service.Socket.emit('fileSource', {
        serialNumber: this.model.serialNumber,
        url: (btnId.indexOf("http") === -1 ? '/' : '') + btnId.replace(/[|]/igm, "/")
    });
};

ConsoleIO.App.Device.Explorer.prototype.onOpenEnd = function onOpenEnd(itemId, state) {
    if (!this.nodes.processing) {
        var index = this.nodes.opened.indexOf(itemId);

        if (state === 1 && index === -1) {
            this.nodes.opened.push(itemId);
        } else if (index > -1) {
            this.nodes.opened.splice(index, 1);
        }
    }
};

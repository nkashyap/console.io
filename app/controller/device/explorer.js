/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:29
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Explorer");

ConsoleIO.App.Device.Explorer = function ExplorerController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.store = {
        folder: [],
        files: []
    };

    this.view = new ConsoleIO.View.Device.Explorer(this, this.model);
    ConsoleIO.Service.Socket.on('device:files:' + this.model.guid, this.add, this);

    this.refresh();
};

ConsoleIO.App.Device.Explorer.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.guid, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Device.Explorer.prototype.getParentId = function getParentId(list, item) {
    var index = list.indexOf(item);
    if (index > 0) {
        return (list.slice(0, index)).join('|');
    }
    return 0;
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
                    this.view.add(id, name, parentId, ConsoleIO.Constraint.ICONS[isJSFile ? 'JAVASCRIPT' : isCSSFile ? 'STYLESHEET' : 'FILE']);
                }
            } else {
                if (this.store.folder.indexOf(id) === -1) {
                    this.store.folder.push(id);

                    this.view.add(id, name, parentId, ConsoleIO.Constraint.ICONS[isHttpFile ? 'WEB' : 'FOLDEROPEN']);
                }
            }
        }, this);

    }, this);
};

ConsoleIO.App.Device.Explorer.prototype.refresh = function refresh() {
    ConsoleIO.forEach(this.store.folder, function (folder) {
        this.deleteItem(folder);
    }, this.view);

    this.store = {
        folder: [],
        files: []
    };

    ConsoleIO.Service.Socket.emit('reloadFiles', this.model.guid);
};

ConsoleIO.App.Device.Explorer.prototype.buttonClick = function buttonClick(btnId) {
    console.log('buttonClick', btnId);
    if (btnId === 'refresh') {
        this.refresh();
    }
};

ConsoleIO.App.Device.Explorer.prototype.viewFile = function viewFile(fileId) {
    ConsoleIO.Service.Socket.emit('fileSource', {
        guid: this.model.guid,
        url: '/' + fileId.replace(/[|]/igm, "/")
    });
};
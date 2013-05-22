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

    this.reloadFiles();
};

ConsoleIO.App.Device.Explorer.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.guid, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Device.Explorer.prototype.getParentId = function getParentId(list, item) {
    var index = list.indexOf(item);
    if(index > 0){
        return (list.slice(0, index)).join('-');
    }
    return 0;
};

ConsoleIO.App.Device.Explorer.prototype.add = function add(data) {
    ConsoleIO.forEach(data.files, function(file){
        file = file.split('?')[0];

        var regex = new RegExp("((http|https)://)?([^/]+)",'img'),
            path = file.match(regex);

        ConsoleIO.forEach(path, function(name){
            var isJSFile = name.indexOf('.js') > -1,
                isCSSFile = name.indexOf('.css') > -1,
                isHttpFile = name.indexOf('http') > -1,
                parentId = this.getParentId(path, name),
                id = parentId ? parentId +'-'+ name : name;

            if(isJSFile || isCSSFile){
                if(this.store.files.indexOf(id) === -1){
                    this.store.files.push(id);
                    this.view.add(id, name, parentId, isJSFile ? 'javascript.gif' : isCSSFile ? 'stylesheet.gif' : null);
                }
            }else{
                if(this.store.folder.indexOf(id) === -1){
                    this.store.folder.push(id);
                    this.view.add(id, name, parentId, isHttpFile? 'web.png': '../../' + ConsoleIO.Constraint.IMAGE_URL.get('tree') + '/folderOpen.gif');
                }
            }
        }, this);

    }, this);
};

ConsoleIO.App.Device.Explorer.prototype.reloadFiles = function reloadFiles() {
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
       this.reloadFiles();
    }
};

ConsoleIO.App.Device.Explorer.prototype.viewFile = function viewFile(itemId) {
    ConsoleIO.Service.Commands.viewFile(this.model.name, itemId);
};
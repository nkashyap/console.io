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
    ConsoleIO.Service.Socket.on('device:includedFiles', this.add, this);
};

ConsoleIO.App.Device.Explorer.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.guid, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Device.Explorer.prototype.add = function add(data) {
//    var name = data.browser + '-' + data.version;
//
//    if (this.store.os.indexOf(data.os) === -1) {
//        this.view.add(data.os, data.os, 0, data.os.toLowerCase() + '.png');
//        this.store.os.push(data.os);
//    }
//
//    if (this.store.browser.indexOf(name) === -1) {
//        this.view.add(data.browser, data.browser, data.os, data.browser.toLowerCase() + '.png');
//        this.view.add(name, data.version, data.browser, 'version.gif');
//        this.store.browser.push(name);
//    }
//
//    this.view.add(data.name, data.browser + '|' + data.number, name);

    console.log('add', data);
};

ConsoleIO.App.Device.Explorer.prototype.buttonClick = function buttonClick(btnId) {
    console.log('buttonClick', btnId);
    if (btnId === 'refresh') {
        ConsoleIO.forEach(this.store.folder, function (os) {
            this.deleteItem(os);
        }, this.view);

        this.store = {
            folder: [],
            files: []
        };

        ConsoleIO.Service.Socket.emit('getIncludedFiles:'+ this.model.guid);
    }
};

ConsoleIO.App.Device.Explorer.prototype.viewFile = function viewFile(itemId) {
    ConsoleIO.Service.Commands.viewFile(this.model.name, itemId);
};
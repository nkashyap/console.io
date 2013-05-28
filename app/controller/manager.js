/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 18/05/13
 * Time: 20:43
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Manager");

ConsoleIO.App.Manager = function ManagerController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.activeTab = null;
    this.store = {
        guid: [],
        device: []
    };
    this.exportFrame = null;
    this.view = new ConsoleIO.View.Manager(this, this.model);

    ConsoleIO.Service.Socket.on('user:subscribed', this.add, this);
    ConsoleIO.Service.Socket.on('user:unSubscribed', this.remove, this);
    ConsoleIO.Service.Socket.on('user:exportReady', this.exportReady, this);
};

ConsoleIO.App.Manager.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.guid, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Manager.prototype.add = function add(data) {
    if (this.store.guid.indexOf(data.guid) === -1) {
        this.store.guid.push(data.guid);
        this.view.add(data.guid, data.name, this.store.guid.length > 0);

        var device = new ConsoleIO.App.Device(this, data);
        this.store.device.push(device);
        device.render(this.view.getContextById(data.guid));
    }
};

ConsoleIO.App.Manager.prototype.remove = function remove(data) {
    var index = this.store.guid.indexOf(data.guid);
    if (index > -1) {
        this.store.guid.splice(index, 1);
        this.view.remove(data.guid);

        if (this.activeTab === data.guid) {
            this.activeTab = null;
        }

        ConsoleIO.every(this.store.device, function (device, index) {
            if (device.guid === data.guid) {
                //device.destroy();
                this.splice(index, 1);
                return false;
            }

            return true;
        });
    }
};

ConsoleIO.App.Manager.prototype.exportReady = function exportReady(data) {
    if (!this.exportFrame) {
        this.exportFrame = ConsoleIO.Service.DHTMLXHelper.createElement({
            tag: 'iframe',
            target: document.body
        });
    }

    this.exportFrame.src = data.file;
};

ConsoleIO.App.Manager.prototype.close = function close(guid) {
    ConsoleIO.Service.Socket.emit('unSubscribe', guid);
    //this.remove(itemId);
};

ConsoleIO.App.Manager.prototype.onTabClick = function onTabClick(tabId) {
    this.activeTab = tabId;
};

ConsoleIO.App.Manager.prototype.getActiveDeviceGuid = function getActiveDeviceGuid() {
    return this.activeTab;
};
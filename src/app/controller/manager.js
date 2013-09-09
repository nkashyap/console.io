/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Manager");

ConsoleIO.App.Manager = function ManagerController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.activeTab = null;
    this.store = {
        serialNumber: [],
        device: []
    };
    this.exportFrame = null;
    this.view = new ConsoleIO.View.Manager(this, this.model);

    ConsoleIO.Service.Socket.on('user:subscribed', this.add, this);
    ConsoleIO.Service.Socket.on('user:unSubscribed', this.remove, this);
    ConsoleIO.Service.Socket.on('user:exportReady', this.exportReady, this);
};

ConsoleIO.App.Manager.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.serialNumber, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Manager.prototype.add = function add(data) {
    if (this.store.serialNumber.indexOf(data.serialNumber) === -1) {
        this.store.serialNumber.push(data.serialNumber);
        this.view.add(data.serialNumber, data.name, this.store.serialNumber.length > 0);

        var device = new ConsoleIO.App.Device(this, data);
        this.store.device.push(device);
        device.render(this.view.getContextById(data.serialNumber));
    }
};

ConsoleIO.App.Manager.prototype.update = function update(data) {
    if (this.store.serialNumber.indexOf(data.serialNumber) > -1) {
        this.view.update(data.serialNumber, data.name);
    }
};

ConsoleIO.App.Manager.prototype.remove = function remove(data) {
    var index = this.store.serialNumber.indexOf(data.serialNumber);
    if (index > -1) {
        this.store.serialNumber.splice(index, 1);
        this.view.remove(data.serialNumber);

        if (this.activeTab === data.serialNumber) {
            this.activeTab = this.store.serialNumber[0];
            if (this.activeTab) {
                this.view.setActive(this.activeTab);
            }
        }

        ConsoleIO.every(this.store.device, function (device, index) {
            if (device.model.serialNumber === data.serialNumber) {
                this.store.device.splice(index, 1);
                return false;
            }

            return true;
        }, this);
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

ConsoleIO.App.Manager.prototype.close = function close(serialNumber) {
    ConsoleIO.Service.Socket.emit('unSubscribe', serialNumber);
};

ConsoleIO.App.Manager.prototype.onTabClick = function onTabClick(tabId) {
    if (this.activeTab && this.activeTab === tabId) {
        return;
    }

    var device;
    if (this.activeTab) {
        device = this.getDevice(this.activeTab);
        if (device) {
            device.activate(false);
        }
    }

    this.activeTab = tabId;
    device = this.getDevice(this.activeTab);
    if (device) {
        device.activate(true);
    }
};

ConsoleIO.App.Manager.prototype.getActiveDeviceSerialNumber = function getActiveDeviceSerialNumber() {
    return this.activeTab;
};

ConsoleIO.App.Manager.prototype.getDevice = function getDevice(serialNumber) {
    var device;

    ConsoleIO.every(this.store.device, function (item) {
        if (item.model.serialNumber === serialNumber) {
            device = item;
            return false;
        }

        return true;
    }, this);

    return device;
};
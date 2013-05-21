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
    this.store = {
        name: [],
        device: []
    };

    this.view = new ConsoleIO.View.Manager(this, this.model);

    ConsoleIO.Service.Socket.on('user:subscribed', this.add, this);
    ConsoleIO.Service.Socket.on('user:unSubscribed', this.remove, this);
};

ConsoleIO.App.Manager.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.id, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Manager.prototype.add = function add(data) {
    if (this.store.name.indexOf(data.name) === -1) {
        this.store.name.push(data.name);
        this.view.add(data.name, this.store.name.length > 0);

        var device = new ConsoleIO.App.Device(this, {
            name: data.name
        });
        this.store.device.push(device);
        device.render(this.view.getContextById(data.name));
    }
};

ConsoleIO.App.Manager.prototype.remove = function remove(data) {
    var index = this.store.name.indexOf(data.name);
    if (index > -1) {
        this.store.name.splice(index, 1);
        this.view.remove(data.name);

        ConsoleIO.every(this.store.device, function (device, index) {
            if (device.name === data.name) {
                //device.destroy();
                this.splice(index, 1);
                return false;
            }

            return true;
        });
    }
};

ConsoleIO.App.Manager.prototype.close = function close(itemId) {
    ConsoleIO.Service.Socket.emit('unSubscribe', itemId);
    //this.remove(itemId);
};
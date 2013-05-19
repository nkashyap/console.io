/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 18/05/13
 * Time: 20:43
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Manager");

ConsoleIO.App.Manager = function ManagerController(parent, model){
    this.parent = parent;
    this.model = model;
    this.devices = [];

    this.view = new ConsoleIO.View.Manager(this, this.model);
};

ConsoleIO.App.Manager.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.id, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Manager.prototype.add = function add(device) {
    if(this.devices.indexOf(device) === -1){
        this.devices.push(device);
    }

    this.view.add(device, this.devices.length > 0);
};

ConsoleIO.App.Manager.prototype.remove = function remove(device) {
    var index = this.devices.indexOf(device);
    if(index > -1){
        this.devices.splice(index, 1);
        this.view.remove(device);
    }
};

ConsoleIO.App.Manager.prototype.close = function close(itemId) {
    console.log('close', itemId);
};
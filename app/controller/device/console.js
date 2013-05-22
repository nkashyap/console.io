/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Console");

ConsoleIO.App.Device.Console = function ConsoleController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.active = true;
    this.store = [];
    this.view = new ConsoleIO.View.Device.Console(this, {
        name: "Console",
        guid: this.model.guid,
        toolbar: [
            { id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: 'refresh.gif', tooltip: 'Refresh' }
        ]
    });

    ConsoleIO.Service.Socket.on('device:console:' + this.model.guid, this.add, this);
};

ConsoleIO.App.Device.Console.prototype.render = function render(target) {
    this.view.render(target);
};

ConsoleIO.App.Device.Console.prototype.add = function add(data) {
    if (this.active) {
        this.view.add(data);
    } else {
        this.store.push(data);
    }
};

ConsoleIO.App.Device.Console.prototype.activate = function activate(state) {
    this.active = state;
    if (this.active && this.store.length > 0) {
        ConsoleIO.forEach(this.store, this.add, this);
    }
};

ConsoleIO.App.Device.Console.prototype.buttonClick = function buttonClick(btnId) {
    console.log('buttonClick', btnId);
    if (btnId === 'refresh') {
        //this.refresh();
    }
};
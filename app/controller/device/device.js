/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 12:17
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device");

ConsoleIO.App.Device = function DeviceController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.context = {
        explorer: "a",
        panel: "b"
    };

    this.view = new ConsoleIO.View.Device(this, this.model);
    this.explorer = new ConsoleIO.App.Device.Explorer(this, {
        name: this.model.name,
        title: 'Files',
        contextId: 'explorer',
        width: 200,
        toolbar: [
            { id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: 'refresh.gif', tooltip: 'Refresh' }
        ]
    });
    this.panel = new ConsoleIO.App.Device.Panel(this, {
        name: this.model.name
    });
};

ConsoleIO.App.Device.prototype.render = function render(target) {
    this.view.render(target);
    this.explorer.render(this.view.getContextById(this.context.explorer));
    this.panel.render(this.view.getContextById(this.context.panel));
};

ConsoleIO.App.Device.prototype.setTitle = function setTitle(name, title) {
    this.view.setTitle(this.context[name], title);
};
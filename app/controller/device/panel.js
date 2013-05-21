/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 20/05/13
 * Time: 15:02
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Panel");

ConsoleIO.App.Device.Panel = function PanelController(parent, model){
    this.parent = parent;
    this.model = model;

    this.view = new ConsoleIO.View.Device.Panel(this, {
        name: this.model.name
    });

    this.console = new ConsoleIO.App.Device.Console(this, this.model);
    this.source = new ConsoleIO.App.Device.Source(this, this.model);
    this.preview = new ConsoleIO.App.Device.Preview(this, this.model);
    this.status = new ConsoleIO.App.Device.Status(this, this.model);
};

ConsoleIO.App.Device.Panel.prototype.render = function render(target) {
    this.view.render(target);
    this.console.render(this.view.tabs);
    this.source.render(this.view.tabs);
    this.preview.render(this.view.tabs);
    this.status.render(this.view.tabs);
};

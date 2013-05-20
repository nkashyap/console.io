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

    this.tabs = ["Console","Source","Preview"];

    this.view = new ConsoleIO.View.Device.Panel(this, {
        name: this.model.name,
        tabs: this.tabs
    });

    this.console = new ConsoleIO.App.Device.Console(this, {});
    this.source = new ConsoleIO.App.Device.Source(this, {});
    this.preview = new ConsoleIO.App.Device.Preview(this, {});
};

ConsoleIO.App.Device.Panel.prototype.render = function render(target) {
    this.view.render(target);
    this.console.render(this.view.getContextById(this.context.console));
    this.source.render(this.view.getContextById(this.context.source));
    this.source.render(this.view.getContextById(this.context.preview));
};

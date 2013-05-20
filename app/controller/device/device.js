/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 12:17
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device");

ConsoleIO.App.Device = function DeviceController(parent, model){
    this.parent = parent;
    this.model = model;

    this.context = {
        explorer: "a",
        device: "b"
    };

    this.view = new ConsoleIO.View.Device(this, this.model);

    this.explorer = new ConsoleIO.App.Explorer(this, {
        name: this.model.name,
        title: 'Files',
        contextId: 'explorer',
        width: 200,
        toolbar: [{ id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: '', tooltip: 'Refresh' }]
    });
    
    this.console = new ConsoleIO.App.Console(this, {});
    this.source = new ConsoleIO.App.Source(this, {});
    this.preview = new ConsoleIO.App.Preview(this, {});
};

ConsoleIO.App.Device.prototype.render = function render(target) {
    this.view.render(target);

    this.explorer.render(this.view.getContextById(this.context.explorer));
    //this.console.render(this.view.getContextById(this.context.console));
    //this.source.render(this.view.getContextById(this.context.source));
    //this.preview.render(this.view.getContextById(this.context.preview));
};

ConsoleIO.App.Device.prototype.setTitle = function setTitle(name, title) {
    this.view.setTitle(this.context[name], title);
};
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
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.PlayPause,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Clear,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Export,
            ConsoleIO.Model.DHTMLX.ToolBarItem.PageSize,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Info,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Log,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Warn,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Debug,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Error
        ]
    });

    ConsoleIO.Service.Socket.on('device:console:' + this.model.guid, this.add, this);
};

ConsoleIO.App.Device.Console.prototype.render = function render(target) {
    this.view.render(target);
};

ConsoleIO.App.Device.Console.prototype.activate = function activate(state) {
    this.active = state;
    if (this.active && this.store.length > 0) {
        this.view.addBatch(this.store);
    }
};

ConsoleIO.App.Device.Console.prototype.add = function add(data) {
    if (this.active) {
        this.view.add(data);
    } else {
        this.store.push(data);
    }
};

ConsoleIO.App.Device.Console.prototype.buttonClick = function buttonClick(btnId, state) {
    if(!this.parent.buttonClick(this, btnId, state)){
        console.log('buttonClick', btnId);
    }
};
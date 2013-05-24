/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Preview");

ConsoleIO.App.Device.Preview = function PreviewController(parent, model) {
    this.parent = parent;
    this.model = model;

    this.view = new ConsoleIO.View.Device.Preview(this, {
        name: "Preview",
        guid: this.model.guid,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh,
            ConsoleIO.Model.DHTMLX.ToolBarItem.WordWrap,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SelectAll,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Copy,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Preview
        ]
    });
    this.editor = new ConsoleIO.App.Editor(this, {});

    ConsoleIO.Service.Socket.on('device:content:' + this.model.guid, this.add, this);
};

ConsoleIO.App.Device.Preview.prototype.render = function render(target) {
    this.view.render(target);
    this.editor.render(this.view.tab);
};

ConsoleIO.App.Device.Preview.prototype.activate = function activate(state) {
    if (state) {
        this.refresh();
    }
};

ConsoleIO.App.Device.Preview.prototype.add = function add(data) {
    this.editor.add(data);
};

ConsoleIO.App.Device.Preview.prototype.refresh = function refresh() {
    ConsoleIO.Service.Socket.emit('reloadHTML', this.model.guid);
};

ConsoleIO.App.Device.Preview.prototype.buttonClick = function buttonClick(btnId, state) {
    console.log('buttonClick', btnId, state);
    switch (btnId) {
        case 'refresh':
            this.refresh();
            break;
        case 'wordwrap':
            this.editor.setOption('lineWrapping', state);
            break;
    }
};
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Source");

ConsoleIO.App.Device.Source = function SourceController(parent, model) {
    this.parent = parent;
    this.model = model;

    this.view = new ConsoleIO.View.Device.Source(this, {
        name: "Source",
        guid: this.model.guid,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh,
            ConsoleIO.Model.DHTMLX.ToolBarItem.WordWrap,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SelectAll,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Copy
        ]
    });

    this.editor = new ConsoleIO.App.Editor(this, {
        codeMirror: {
            mode: 'javascript'
        }
    });

    ConsoleIO.Service.Socket.on('device:source:' + this.model.guid, this.add, this);
};

ConsoleIO.App.Device.Source.prototype.render = function render(target) {
    this.view.render(target);
    this.editor.render(this.view.tab);
};

ConsoleIO.App.Device.Source.prototype.activate = function activate(state) {
    if (state) {
        this.refresh();
    }
};

ConsoleIO.App.Device.Source.prototype.add = function add(data) {
    this.editor.add(data);
    this.view.setActive();
};

ConsoleIO.App.Device.Source.prototype.refresh = function refresh() {
    //ConsoleIO.Service.Socket.emit('reloadSource', {
    // guid: this.model.guid
    // });
};

ConsoleIO.App.Device.Source.prototype.buttonClick = function buttonClick(btnId, state) {
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
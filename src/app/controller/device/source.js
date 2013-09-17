/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Source");

ConsoleIO.App.Device.Source = function SourceController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.url = null;
    this.context = {
        explorer: "a",
        source: "b"
    };

    this.view = new ConsoleIO.View.Device.Source(this, {
        name: "Source",
        serialNumber: this.model.serialNumber,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.WordWrap,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SelectAll,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Copy
        ]
    });
    this.explorer = new ConsoleIO.App.Device.Explorer(this, {
        name: this.model.name,
        serialNumber: this.model.serialNumber,
        title: 'Files',
        contextId: 'explorer',
        width: 200,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh
        ]
    });
    this.editor = new ConsoleIO.App.Editor(this, {
        codeMirror: {
            mode: 'javascript'
        },
        title: 'Code',
        contextId: 'source'
    });

    ConsoleIO.Service.Socket.on('device:source:' + this.model.serialNumber, this.add, this);
};

ConsoleIO.App.Device.Source.prototype.render = function render(target) {
    this.view.render(target);
    this.explorer.render(this.view.getContextById(this.context.explorer));
    this.editor.render(this.view.getContextById(this.context.source));
};

ConsoleIO.App.Device.Source.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:source:' + this.model.serialNumber, this.add, this);
    this.explorer = this.explorer.destroy();
    this.editor = this.editor.destroy();
    this.view = this.view.destroy();
};

ConsoleIO.App.Device.Source.prototype.activate = function activate(state) {
    if (state && ConsoleIO.Settings.reloadTabContentWhenActivated) {
        this.refresh();
        this.explorer.refresh();
    }
};

ConsoleIO.App.Device.Source.prototype.setTitle = function setTitle(contextId, title) {
    this.view.setTitle(this.context[contextId], title);
};

ConsoleIO.App.Device.Source.prototype.add = function add(data) {
    this.url = data.url;
    this.editor.add(data);
    this.setTitle('source', this.url);
};

ConsoleIO.App.Device.Source.prototype.refresh = function refresh() {
    if (this.url) {
        ConsoleIO.Service.Socket.emit('fileSource', {
            serialNumber: this.model.serialNumber,
            url: this.url
        });
    }
};

ConsoleIO.App.Device.Source.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        console.log('onButtonClick', btnId);
    }
};
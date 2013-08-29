/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
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
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.WordWrap,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SelectAll,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Copy,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Preview,
            ConsoleIO.Model.DHTMLX.ToolBarItem.ScreenShot
        ]
    });
    this.editor = new ConsoleIO.App.Editor(this, {});

    ConsoleIO.Service.Socket.on('device:content:' + this.model.guid, this.add, this);
    ConsoleIO.Service.Socket.on('device:previewContent:' + this.model.guid, this.preview, this);
    ConsoleIO.Service.Socket.on('device:screenShot:' + this.model.guid, this.screenShot, this);
};

ConsoleIO.App.Device.Preview.prototype.render = function render(target) {
    this.view.render(target);
    this.editor.render(this.view.tab);
};

ConsoleIO.App.Device.Preview.prototype.activate = function activate(state) {
    if (state && ConsoleIO.Settings.reloadTabContentWhenActivated) {
        this.refresh();
    }
};

ConsoleIO.App.Device.Preview.prototype.add = function add(data) {
    this.editor.add(data);
};

ConsoleIO.App.Device.Preview.prototype.preview = function preview(data) {
    this.view.toggleButton('preview', true);
    this.view.preview(data);
};

ConsoleIO.App.Device.Preview.prototype.screenShot = function screenShot(data) {
    this.view.toggleButton('screenShot', true);
    this.view.screenShot(data);
};

ConsoleIO.App.Device.Preview.prototype.refresh = function refresh() {
    ConsoleIO.Service.Socket.emit('reloadHTML', { guid: this.model.guid });
};

ConsoleIO.App.Device.Preview.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        switch (btnId) {
            case 'preview':
                this.view.toggleButton('preview', false);
                ConsoleIO.Service.Socket.emit('previewHTML', { guid: this.model.guid });
                break;
            case 'screenShot':
                this.view.toggleButton('screenShot', false);
                ConsoleIO.Service.Socket.emit('captureScreen', { guid: this.model.guid });
                var scope = this;
                setTimeout(function () {
                    scope.view.toggleButton('screenShot', true);
                }, 10000);
                break;
        }
    }
};
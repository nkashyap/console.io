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
        serialNumber: this.model.serialNumber,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.WordWrap,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Beautify,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SelectAll,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Copy,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Preview,
            ConsoleIO.Model.DHTMLX.ToolBarItem.ScreenShot
        ]
    });
    this.editor = new ConsoleIO.App.Editor(this, {});

    ConsoleIO.Service.Socket.on('device:content:' + this.model.serialNumber, this.addContent, this);
    ConsoleIO.Service.Socket.on('device:previewContent:' + this.model.serialNumber, this.preview, this);
    ConsoleIO.Service.Socket.on('device:screenShot:' + this.model.serialNumber, this.screenShot, this);
};


ConsoleIO.App.Device.Preview.prototype.render = function render(target) {
    this.view.render(target);
    this.editor.render(this.view.tab);
};

ConsoleIO.App.Device.Preview.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:content:' + this.model.serialNumber, this.addContent, this);
    ConsoleIO.Service.Socket.off('device:previewContent:' + this.model.serialNumber, this.preview, this);
    ConsoleIO.Service.Socket.off('device:screenShot:' + this.model.serialNumber, this.screenShot, this);
    this.editor = this.editor.destroy();
    this.view = this.view.destroy();
};


ConsoleIO.App.Device.Preview.prototype.activate = function activate(state) {
    if (state && ConsoleIO.Settings.reloadTabContentWhenActivated) {
        this.editor.setOption('lineWrapping', this.parent.wordWrap);
        this.refresh();
    }
};

ConsoleIO.App.Device.Preview.prototype.addContent = function addContent(data) {
    this.editor.setValue(data);
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
    ConsoleIO.Service.Socket.emit('reloadHTML', {
        serialNumber: this.model.serialNumber,
        beautify: this.parent.beautify
    });
};


ConsoleIO.App.Device.Preview.prototype.setTabActive = function setTabActive() {
    this.view.setTabActive();
};

ConsoleIO.App.Device.Preview.prototype.setItemState = function setItemState(id, state) {
    this.view.setItemState(id, state);
};


ConsoleIO.App.Device.Preview.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        switch (btnId) {
            case 'preview':
                this.view.toggleButton('preview', false);
                ConsoleIO.Service.Socket.emit('previewHTML', {
                    serialNumber: this.model.serialNumber
                });
                break;
            case 'screenShot':
                this.view.toggleButton('screenShot', false);
                ConsoleIO.Service.Socket.emit('captureScreen', {
                    serialNumber: this.model.serialNumber
                });
                var scope = this;
                setTimeout(function () {
                    scope.view.toggleButton('screenShot', true);
                }, 10000);
                break;
            default:
                this.parent.parent.parent.server.update({
                    status: 'Unhandled event',
                    btnId: btnId,
                    state: state
                });
                break;
        }
    }
};
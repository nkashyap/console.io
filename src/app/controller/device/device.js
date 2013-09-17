/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device");

ConsoleIO.App.Device = function DeviceController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.activeTab = null;

    this.console = new ConsoleIO.App.Device.Console(this, this.model);
    this.source = new ConsoleIO.App.Device.Source(this, this.model);
    this.preview = new ConsoleIO.App.Device.Preview(this, this.model);
    this.status = new ConsoleIO.App.Device.Status(this, this.model);
    this.view = new ConsoleIO.View.Device(this, this.model);
};

ConsoleIO.App.Device.prototype.render = function render(target) {
    this.view.render(target);
    this.status.render(this.view.tabs);
    this.source.render(this.view.tabs);
    this.preview.render(this.view.tabs);
    this.console.render(this.view.tabs);
};

ConsoleIO.App.Device.prototype.destroy = function destroy() {
    this.console = this.console.destroy();
    this.source = this.source.destroy();
    this.preview = this.preview.destroy();
    this.status = this.status.destroy();
    this.view = this.view.destroy();
};

ConsoleIO.App.Device.prototype.update = function update(data) {
    this.parent.update(data);
};

ConsoleIO.App.Device.prototype.activate = function activate(state) {
    if (!state) {
        this.status.activate(state);
        this.source.activate(state);
        this.preview.activate(state);
        this.console.activate(state);
    } else if (this.activeTab) {
        this[this.activeTab].activate(state);
    }
};

ConsoleIO.App.Device.prototype.onTabClick = function onTabClick(tabId) {
    var newTab = (tabId.split('-')[0]).toLowerCase();

    if (this.activeTab && this.activeTab === newTab) {
        return;
    }

    if (this.activeTab) {
        this[this.activeTab].activate(false);
    }

    this.activeTab = newTab;
    this[this.activeTab].activate(true);
};

ConsoleIO.App.Device.prototype.onButtonClick = function onButtonClick(tab, btnId, state) {
    var handled = false;

    switch (btnId) {
        case 'reload':
            ConsoleIO.Service.Socket.emit('reloadDevice', {
                serialNumber: this.model.serialNumber
            });
            handled = true;
            break;

        //common on Status, Source and Preview Tabs
        case 'refresh':
            tab.refresh();
            handled = true;
            break;

        //common on Source and Preview Tabs
        case 'wordwrap':
            tab.editor.setOption('lineWrapping', state);
            handled = true;
            break;
        case 'selectAll':
            tab.editor.selectAll();
            handled = true;
            break;
        case 'copy':
            tab.editor.copy();
            handled = true;
            break;
    }

    return handled;
};
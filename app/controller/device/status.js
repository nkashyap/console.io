/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 20/05/13
 * Time: 19:28
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Status");

ConsoleIO.App.Device.Status = function StatusController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.model.plugins.WebIO = this.model.plugins.WebIO || { enabled: false };

    ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameText.value = this.model.name;
    this.view = new ConsoleIO.View.Device.Status(this, {
        name: "Status",
        guid: this.model.guid,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.WebIO,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameLabel,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameText,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameSet
        ]
    });

    ConsoleIO.Service.Socket.on('device:status:' + this.model.guid, this.add, this);
    ConsoleIO.Service.Socket.on('device:plugin:' + this.model.guid, this.plugin, this);
};

ConsoleIO.App.Device.Status.prototype.render = function render(target) {
    this.view.render(target);
    this.view.setItemState('webIO', this.model.plugins.WebIO.enabled);
};

ConsoleIO.App.Device.Status.prototype.plugin = function plugin(plugin) {
    if (plugin.name === 'WebIO') {
        this.model.plugins.WebIO.enabled = plugin.enabled;
        this.view.setItemState('webIO', this.model.plugins.WebIO.enabled);
    }
};

ConsoleIO.App.Device.Status.prototype.activate = function activate(state) {
    if (state && ConsoleIO.Settings.reloadTabContentWhenActivated) {
        this.refresh();
    }
};

ConsoleIO.App.Device.Status.prototype.add = function add(data) {
    ConsoleIO.forEachProperty(data, function (value, property) {
        this.view.addLabel(property);
        ConsoleIO.forEachProperty(value, function (config, name) {
            if (name === 'More') {
                config = config.join(", ");
                if (!config) {
                    return;
                }
            }

            this.view.add(name, typeof config === 'string' ? config.replace(/"/igm, "") : config, property);
        }, this);
    }, this);
};

ConsoleIO.App.Device.Status.prototype.refresh = function refresh() {
    this.view.clear();
    ConsoleIO.Service.Socket.emit('deviceStatus', { guid: this.model.guid });
};

ConsoleIO.App.Device.Status.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        switch (btnId) {
            case 'deviceNameSet':
                var name = this.view.getValue('deviceNameText');
                if (!!name) {
                    ConsoleIO.Service.Socket.emit('deviceName', {
                        guid: this.model.guid,
                        name: name
                    });
                    this.model.name = name;
                    this.parent.update(this.model);
                }
                break;
            case 'webIO':
                if (this.model.plugins.WebIO.enabled !== state) {
                    this.model.plugins.WebIO.enabled = state;
                    ConsoleIO.Service.Socket.emit('plugin', {
                        guid: this.model.guid,
                        WebIO: ConsoleIO.extend({
                            enabled: state
                        }, ConsoleIO.Settings.WebIO)
                    });
                }
                break;
        }
    }
};
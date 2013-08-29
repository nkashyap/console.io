/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Status");

ConsoleIO.App.Device.Status = function StatusController(parent, model) {
    this.parent = parent;
    this.model = model;
    //this.model.plugins.Web = this.model.plugins.Web || { enabled: false };

    ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameText.value = this.model.name;
    this.view = new ConsoleIO.View.Device.Status(this, {
        name: "Status",
        guid: this.model.guid,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            //ConsoleIO.Model.DHTMLX.ToolBarItem.Web,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameLabel,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameText,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameSet
        ]
    });

    ConsoleIO.Service.Socket.on('device:status:' + this.model.guid, this.add, this);
    //ConsoleIO.Service.Socket.on('device:plugin:' + this.model.guid, this.plugin, this);
};

ConsoleIO.App.Device.Status.prototype.render = function render(target) {
    this.view.render(target);
    //this.view.setItemState('web', this.model.plugins.Web.enabled);
};

//ConsoleIO.App.Device.Status.prototype.plugin = function plugin(plugin) {
//    if (plugin.name === 'Web') {
//        this.model.plugins.Web.enabled = plugin.enabled;
//        this.view.setItemState('web', this.model.plugins.Web.enabled);
//    }
//};

ConsoleIO.App.Device.Status.prototype.activate = function activate(state) {
    if (state && ConsoleIO.Settings.reloadTabContentWhenActivated) {
        this.refresh();
    }
};

ConsoleIO.App.Device.Status.prototype.add = function add(data) {
    this.view.clear();
    ConsoleIO.forEachProperty(data, function (value, property) {
        this.view.addLabel(property);
        ConsoleIO.forEachProperty(value, function (config, name) {
            switch (name.toLowerCase()) {
                case 'more':
                    config = config.join(", ");
                    if (!config) {
                        return;
                    }
                    break;
                case 'search':
                case 'href':
                    config = ConsoleIO.queryParams(config);
                    break;
                case 'cookie':
                    config = ConsoleIO.cookieToJSON(config);
                    break;
            }

            this.view.add(name, typeof config === 'string' ? config.replace(/"/igm, "") : config, property);
        }, this);
    }, this);
};

ConsoleIO.App.Device.Status.prototype.refresh = function refresh() {
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
//            case 'web':
//                if (this.model.plugins.Web.enabled !== state) {
//                    this.model.plugins.Web.enabled = state;
//                    ConsoleIO.Service.Socket.emit('plugin', {
//                        guid: this.model.guid,
//                        web: ConsoleIO.extend({
//                            enabled: state
//                        }, ConsoleIO.Settings.Web)
//                    });
//                }
//                break;
        }
    }
};
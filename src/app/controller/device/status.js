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
    this.activeAccordion = ConsoleIO.Settings.defaultAccordion;

    ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameText.value = this.model.name;
    this.view = new ConsoleIO.View.Device.Status(this, {
        name: "Status",
        serialNumber: this.model.serialNumber,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Web,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameLabel,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameText,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DeviceNameSet
        ]
    });

    ConsoleIO.Service.Socket.on('device:status:' + this.model.serialNumber, this.add, this);
    ConsoleIO.Service.Socket.on('device:web:status:' + this.model.serialNumber, this.web, this);
};


ConsoleIO.App.Device.Status.prototype.render = function render(target) {
    this.view.render(target);
    this.view.setItemState('web', this.model.web.enabled);
};

ConsoleIO.App.Device.Status.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:status:' + this.model.serialNumber, this.add, this);
    ConsoleIO.Service.Socket.off('device:web:status:' + this.model.serialNumber, this.web, this);
    this.view = this.view.destroy();
};


ConsoleIO.App.Device.Status.prototype.web = function web(data) {
    this.model.web.enabled = data.enabled;
    this.view.setItemState('web', data.enabled);
};

ConsoleIO.App.Device.Status.prototype.activate = function activate(state) {
    if (state && ConsoleIO.Settings.reloadTabContentWhenActivated) {
        this.refresh();
    }
};

ConsoleIO.App.Device.Status.prototype.add = function add(data) {
    this.view.clear();

    ConsoleIO.forEach(data.info, function (item) {

        ConsoleIO.forEachProperty(item, function (value, property) {

            this.view.addLabel(property);

            ConsoleIO.forEachProperty(value, function (config, name) {
                switch (name.toLowerCase()) {
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

    }, this);

    this.view.open(this.activeAccordion);
};

ConsoleIO.App.Device.Status.prototype.refresh = function refresh() {
    ConsoleIO.Service.Socket.emit('deviceStatus', {
        serialNumber: this.model.serialNumber
    });
};


ConsoleIO.App.Device.Status.prototype.setTabActive = function setTabActive() {
    this.view.setTabActive();
};

ConsoleIO.App.Device.Status.prototype.setActive = function setActive(id) {
    this.activeAccordion = id;
};


ConsoleIO.App.Device.Status.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        switch (btnId) {
            case 'deviceNameSet':
                var name = this.view.getValue('deviceNameText');
                if (!!name) {
                    ConsoleIO.Service.Socket.emit('deviceName', {
                        serialNumber: this.model.serialNumber,
                        name: name
                    });
                    this.model.name = name;
                    this.parent.update(this.model);
                }
                break;
            case 'web':
                if (this.model.web.enabled !== state) {
                    this.model.web.enabled = state;
                    ConsoleIO.Service.Socket.emit('webConfig', {
                        serialNumber: this.model.serialNumber,
                        enabled: this.model.web.enabled
                    });
                }
                break;
        }
    }
};
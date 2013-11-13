/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 24/09/13
 * Time: 12:56
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Profile");

ConsoleIO.App.Device.Profile = function ProfileController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.profiles = {};
    this.activeProfile = null;
    this.openNodes = [];
    this.view = new ConsoleIO.View.Device.Profile(this, {
        name: "Profile",
        serialNumber: this.model.serialNumber,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Profiler,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Clear
        ],
        list: {
            context: 'a',
            title: 'Profiles',
            width: 120
        },
        tree: {
            context: 'b',
            title: 'Active Profile',
            width: 350,
            toolbar: [
                ConsoleIO.Model.DHTMLX.ToolBarItem.ProfileView,
                ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
                ConsoleIO.Model.DHTMLX.ToolBarItem.TimeOrPercent,
                ConsoleIO.Model.DHTMLX.ToolBarItem.FocusFn,
                ConsoleIO.Model.DHTMLX.ToolBarItem.RestoreFn,
                ConsoleIO.Model.DHTMLX.ToolBarItem.ExcludeFn
            ]
        },
        grid: {
            context: 'c',
            title: 'Summary'
        }
    });

    ConsoleIO.Service.Socket.on('device:profile:' + this.model.serialNumber, this.addProfile, this);
    ConsoleIO.Service.Socket.on('device:online:' + this.model.serialNumber, this.syncConfig, this);
};


ConsoleIO.App.Device.Profile.prototype.render = function render(target) {
    this.view.render(target);
    ConsoleIO.async(function () {
        this.syncConfig(this.model);
    }, this);
};

ConsoleIO.App.Device.Profile.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:profile:' + this.model.serialNumber, this.addProfile, this);
    ConsoleIO.Service.Socket.off('device:online:' + this.model.serialNumber, this.syncConfig, this);
    this.view = this.view.destroy();
};

ConsoleIO.App.Device.Profile.prototype.syncConfig = function syncConfig(data) {
    if (data.serialNumber === this.model.serialNumber) {
        this.model = data;
        if (!data.web.config.profile || data.web.config.profile === 'false') {
            this.view.hide();
        } else {
            this.view.show();
        }
    }
};

ConsoleIO.App.Device.Profile.prototype.clear = function clear() {
    ConsoleIO.forEach(ConsoleIO.keys(this.profiles), function (id) {
        this.view.deleteListItem(id);
    }, this);

    this.view.resetTree();
    this.view.resetGrid();
    this.view.setTitle();

    this.profiles = {};
    this.openNodes = [];
    this.activeProfile = null;
};

ConsoleIO.App.Device.Profile.prototype.addProfile = function addProfile(profile) {
    if (this.profiles[profile.uid]) {
        profile.uid = ConsoleIO.getUniqueId();
    }
    this.profiles[profile.uid] = profile;
    this.view.addToList(profile.uid, profile.title, ConsoleIO.Constant.ICONS.PROFILE);
};

ConsoleIO.App.Device.Profile.prototype.addTreeNodes = function addTreeNodes(node, parent) {
    this.view.addTreeItem(parent, node.id, node.functionName || node.id, ConsoleIO.Constant.ICONS.FUNCTIONS);

    if (node.children.length > 0) {
        ConsoleIO.forEach(node.children, function (child) {
            this.addTreeNodes(child, node.id);
        }, this);
    }
};

ConsoleIO.App.Device.Profile.prototype.addGridRows = function addGridRows(node, items) {
    var index = items.indexOf(node.id);

    this.view.addGridItem(this.toDate(node));

    if (index > -1) {
        items.splice(index, 1);
    }

    if (node.children.length > 0) {
        ConsoleIO.forEach(node.children, function (child) {
            if (items.indexOf(child.id) > -1) {
                this.addGridRows(child, items);
            } else {
                this.view.addGridItem(this.toDate(child));
            }
        }, this);
    }
};

ConsoleIO.App.Device.Profile.prototype.toDate = function toDate(node) {
    var data = {
        id: node.id,
        functionName: node.functionName || node.id,
        selfTime: this.parseTime(node.selfTime),
        totalTime: this.parseTime(node.totalTime),
        numberOfCalls: node.numberOfCalls
    };

    if (node.url) {
        data.url = "<a target='_blank' href='" + node.url + "' >" + node.url.substring(node.url.lastIndexOf('/') + 1) + ":" + node.lineNumber + "</a>";
    }

    return data;
};

ConsoleIO.App.Device.Profile.prototype.parseTime = function parseTime(time) {
    return (time / 1000) + ' ms';
};

ConsoleIO.App.Device.Profile.prototype.activate = function activate(state) {

};

ConsoleIO.App.Device.Profile.prototype.setTabActive = function setTabActive() {
    this.view.setTabActive();
};


ConsoleIO.App.Device.Profile.prototype.onTreeOpenEnd = function onTreeOpenEnd(id, state) {
    var index = this.openNodes.indexOf(id);
    this.view.resetGrid();

    if (state === 1 && index === -1) {
        this.openNodes.push(id);
    } else if (state === -1 && index > -1) {
        this.openNodes.splice(index, 1);
    }

    ConsoleIO.async(function () {
        this.addGridRows(this.profiles[this.activeProfile].head, [].concat(this.openNodes));
    }, this);
};

ConsoleIO.App.Device.Profile.prototype.onListClick = function onListClick(id) {
    this.view.resetTree();
    this.view.resetGrid();

    this.activeProfile = id;
    this.openNodes = [];

    var activeProfile = this.profiles[id];
    this.view.setTitle(activeProfile.title);

    ConsoleIO.async(function () {
        this.addTreeNodes(activeProfile.head, 0);
        this.view.closeItem(0, true);
    }, this);
};

ConsoleIO.App.Device.Profile.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        switch (btnId) {
            case 'profiler':
                ConsoleIO.Service.Socket.emit('profiler', {
                    serialNumber: this.model.serialNumber,
                    state: state
                });

                if (state) {
                    this.view.setItemText("Profiler", 'Stop Profiling');
                } else {
                    this.view.setItemText("Profiler");
                }
                break;
            case 'clear':
                this.clear();
                break;
            default:
                console.log(btnId, state);
                break;
        }
    }
};
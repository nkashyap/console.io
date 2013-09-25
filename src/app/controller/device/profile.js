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
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload
        ],
        list: {
            context: 'a',
            title: 'Profiles',
            width: 120
        },
        tree: {
            context: 'b',
            title: 'Tree',
            width: 350
        },
        grid: {
            context: 'c',
            title: 'Summary'
        }
    });

    ConsoleIO.Service.Socket.on('device:profile:' + this.model.serialNumber, this.addProfile, this);
};


ConsoleIO.App.Device.Profile.prototype.render = function render(target) {
    this.view.render(target);
};

ConsoleIO.App.Device.Profile.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:profile:' + this.model.serialNumber, this.profile, this);
    this.view = this.view.destroy();
};

ConsoleIO.App.Device.Profile.prototype.addProfile = function addProfile(profile) {
    console.log(profile);
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

    this.view.addGridItem(node);

    if (index > -1) {
        items.splice(index, 1);
    }

    if (node.children.length > 0) {
        ConsoleIO.forEach(node.children, function (child) {
            if (items.indexOf(child.id) > -1) {
                this.addGridRows(child, items);
            } else {
                this.view.addGridItem(child);
            }
        }, this);
    }
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
    }, this, 10);
};

ConsoleIO.App.Device.Profile.prototype.onListClick = function onListClick(id) {
    this.view.resetTree();
    this.view.resetGrid();

    ConsoleIO.async(function () {
        var node = this.profiles[id].head;
        this.activeProfile = id;
        this.addTreeNodes(node, 0);
        this.view.closeItem(0, true);
    }, this, 10);
};

ConsoleIO.App.Device.Profile.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {

    }
};
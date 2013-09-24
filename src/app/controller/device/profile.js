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
    this.view = new ConsoleIO.View.Device.Profile(this, {
        name: "Profile",
        serialNumber: this.model.serialNumber,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload
        ],
        list: {
            context: 'a',
            title: 'Profiles',
            width: 200
        },
        tree: {
            context: 'b',
            title: 'Tree',
            width: 300
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
    var icon = ConsoleIO.Constant.ICONS.FUNCTIONS,
        id = [node.id, parent].join('-');

    this.view.addTreeItem(parent, id, node.functionName || node.id, icon);

    if (node.children.length > 0) {
        ConsoleIO.forEach(node.children, function (child) {
            this.addTreeNodes(child, id);
        }, this);
    }
};

ConsoleIO.App.Device.Profile.prototype.addGridRows = function addGridRows(node, openedNodeId, parent) {
    var nodeId = [node.id, parent].join('-');
    this.view.addGridItem(node, nodeId);

    if (openedNodeId === nodeId) {
        return false;
    }

    if (node.children.length > 0) {
        ConsoleIO.forEach(node.children, function (child) {
            this.addGridRows(child, openedNodeId, nodeId);
        }, this);
    }
};

ConsoleIO.App.Device.Profile.prototype.activate = function activate(state) {

};

ConsoleIO.App.Device.Profile.prototype.setTabActive = function setTabActive() {
    this.view.setTabActive();
};


ConsoleIO.App.Device.Profile.prototype.onTreeOpenStart = function onTreeOpenStart(id) {
    this.view.resetGrid();

    ConsoleIO.async(function () {
        this.addGridRows(this.profiles[this.activeProfile].head, id, 0);
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
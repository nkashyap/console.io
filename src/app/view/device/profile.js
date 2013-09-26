/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 24/09/13
 * Time: 13:14
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Profile");

ConsoleIO.View.Device.Profile = function ProfileView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;

    this.tab = null;
    this.toolbar = null;
    this.layout = null;
    this.listCell = null;
    this.list = null;
    this.treeCell = null;
    this.treeToolbar = null;
    this.tree = null;
    this.gridCell = null;
    this.grid = null;

    this.id = [this.model.name, this.model.serialNumber].join("-");
};


ConsoleIO.View.Device.Profile.prototype.render = function render(target) {
    this.target = target;
    this.target.addTab(this.id, this.model.name);
    this.tab = this.target.cells(this.id);

    this.toolbar = this.tab.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);
    this.toolbar.attachEvent("onStateChange", function (itemId, state) {
        this.onButtonClick(itemId, state);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);

    this.layout = this.tab.attachLayout('3W');
    this.layout.setEffect("resize", true);

    this.listCell = this.layout.cells(this.model.list.context);
    this.listCell.setText(this.model.list.title);
    this.listCell.setWidth(this.model.list.width);

    this.list = this.listCell.attachTree();
    this.list.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('tree'));
    this.list.setIconPath(ConsoleIO.Settings.iconPath);
    this.list.enableHighlighting(true);
    this.list.enableTreeImages(true);
    this.list.enableTreeLines(true);
    this.list.enableIEImageFix(true);
    this.list.attachEvent("onClick", function (itemId) {
        this.onListClick(itemId);
    }, this.ctrl);


    this.treeCell = this.layout.cells(this.model.tree.context);
    this.treeCell.setText(this.model.tree.title);
    this.treeCell.setWidth(this.model.tree.width);

    this.treeToolbar = this.treeCell.attachToolbar();
    this.treeToolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.treeToolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);
    this.treeToolbar.attachEvent("onStateChange", function (itemId, state) {
        this.onButtonClick(itemId, state);
    }, this.ctrl);
    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.tree.toolbar, this.treeToolbar);

    this.tree = this.treeCell.attachTree();
    this.tree.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('tree'));
    this.tree.setIconPath(ConsoleIO.Settings.iconPath);
    this.tree.enableHighlighting(true);
    this.tree.enableTreeImages(true);
    this.tree.enableTreeLines(true);
    this.tree.enableIEImageFix(true);
    this.tree.attachEvent("onOpenEnd", function (itemId, state) {
        this.onTreeOpenEnd(itemId, state);
        return true;
    }, this.ctrl);


    this.gridCell = this.layout.cells(this.model.grid.context);
    this.gridCell.setText(this.model.grid.title);

    this.grid = this.gridCell.attachGrid();
    this.grid.setIconsPath(ConsoleIO.Settings.iconPath);
    this.grid.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('grid'));
    this.grid.setHeader("Self,Total,Count,Function,Url");
    this.grid.setInitWidthsP("10,10,10,50,20");
    this.grid.setColAlign("right,right,right,left,right");
    this.grid.setColTypes("ro,ro,ro,ro,ro");
    this.grid.setColSorting("int,int,int,str,str");
    this.grid.setSkin(ConsoleIO.Constant.THEMES.get('win'));
    this.grid.init();
};

ConsoleIO.View.Device.Profile.prototype.destroy = function destroy() {
    this.target.removeTab(this.id);
    //this.grid.destructor();
    //this.tree.destructor();
    //this.list.destructor();
};

ConsoleIO.View.Device.Profile.prototype.addToList = function addToList(id, title, icon) {
    this.list.insertNewItem(0, id, title, 0, icon, icon, icon);
};

ConsoleIO.View.Device.Profile.prototype.addTreeItem = function addTreeItem(parent, id, name, icon) {
    this.tree.insertNewItem(parent, id, name, 0, icon, icon, icon);
};

ConsoleIO.View.Device.Profile.prototype.addGridItem = function addGridItem(node) {
    this.grid.addRow(node.id, [
        node.selfTime, node.totalTime, node.numberOfCalls, node.functionName, node.url
    ]);
};

ConsoleIO.View.Device.Profile.prototype.closeItem = function closeItem(id, closeAll) {
    if (!closeAll) {
        this.tree.closeItem(id);
    } else {
        this.tree.closeAllItems(id);
    }
};

ConsoleIO.View.Device.Profile.prototype.deleteListItem = function deleteListItem(id) {
    this.list.deleteItem(id);
};

ConsoleIO.View.Device.Profile.prototype.resetTree = function resetTree() {
    this.tree.deleteItem(this.tree.getItemIdByIndex(0, 0));
};

ConsoleIO.View.Device.Profile.prototype.resetGrid = function resetGrid() {
    this.grid.clearAll();
};


ConsoleIO.View.Device.Profile.prototype.setTabActive = function setTabActive() {
    this.target.setTabActive(this.id);
};

ConsoleIO.View.Device.Profile.prototype.setTitle = function setTitle(title) {
    this.treeCell.setText([this.model.tree.title, title || ''].join(': '));
};

ConsoleIO.View.Device.Profile.prototype.setItemText = function setItemText(name, text) {
    if (this.toolbar) {
        var item = ConsoleIO.Model.DHTMLX.ToolBarItem[name];
        if (item) {
            this.toolbar.setItemText(item.id, text || item.text);
        }
    }
};

ConsoleIO.View.Device.Profile.prototype.showItem = function showItem(name) {
    if (this.treeToolbar) {
        var item = ConsoleIO.Model.DHTMLX.ToolBarItem[name];
        if (item) {
            this.treeToolbar.showItem(item.id);
        }
    }
};

ConsoleIO.View.Device.Profile.prototype.hideItem = function hideItem(name) {
    if (this.treeToolbar) {
        var item = ConsoleIO.Model.DHTMLX.ToolBarItem[name];
        if (item) {
            this.treeToolbar.hideItem(item.id);
        }
    }
};
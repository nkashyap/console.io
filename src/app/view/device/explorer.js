/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Explorer");

ConsoleIO.View.Device.Explorer = function ExplorerView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.tree = null;
    this.target = null;
    this.toolbar = null;
};


ConsoleIO.View.Device.Explorer.prototype.render = function render(target) {
    var scope = this;
    this.target = target;
    this.target.setWidth(this.model.width);

    this.toolbar = this.target.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);

    this.tree = this.target.attachTree();
    this.tree.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('tree'));
    this.tree.setIconPath(ConsoleIO.Settings.iconPath);
    this.tree.enableHighlighting(true);
    this.tree.enableTreeImages(true);
    this.tree.enableTreeLines(true);
    this.tree.enableIEImageFix(true);

    this.tree.attachEvent("onDblClick", function (itemId) {
        if (!scope.tree.hasChildren(itemId)) {
            this.viewFile(itemId);
        }
    }, this.ctrl);

    this.tree.attachEvent("onOpenEnd", function (itemId, state) {
        if (scope.tree.hasChildren(itemId)) {
            this.openNode(itemId, state);
        }
    }, this.ctrl);
};

ConsoleIO.View.Device.Explorer.prototype.destroy = function destroy() {
    this.tree.destructor();
};


ConsoleIO.View.Device.Explorer.prototype.add = function add(id, name, parentId, icon) {
    if (icon) {
        this.tree.insertNewItem(parentId, id, name, 0, icon, icon, icon);
    } else {
        this.tree.insertNewItem(parentId, id, name);
    }
};

ConsoleIO.View.Device.Explorer.prototype.deleteItem = function deleteItem(id) {
    this.tree.deleteItem(id);
};

ConsoleIO.View.Device.Explorer.prototype.closeItem = function closeItem(id, closeAll) {
    if (!closeAll) {
        this.tree.closeItem(id);
    } else {
        this.tree.closeAllItems(id);
    }
};


ConsoleIO.View.Device.Explorer.prototype.setIcon = function setIcon(id, icon) {
    this.tree.setItemImage(id, icon);
};
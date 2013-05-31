/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 11:49
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Browser");

ConsoleIO.View.Browser = function BrowserView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.tree = null;
    this.target = null;
    this.toolbar = null;
};

ConsoleIO.View.Browser.prototype.render = function render(target) {
    var scope = this;
    this.target = target;
    this.target.setWidth(this.model.width);
    this.target.setHeight(this.model.height);

    this.toolbar = this.target.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);

    this.tree = this.target.attachTree();
    this.tree.setImagePath(ConsoleIO.Constraint.IMAGE_URL.get('tree'));
    this.tree.setIconPath(ConsoleIO.Settings.iconPath);
    this.tree.enableHighlighting(true);
    this.tree.enableTreeImages(true);
    this.tree.enableTreeLines(true);
    this.tree.enableIEImageFix(true);
    this.tree.attachEvent("onDblClick", function (itemId) {
        if (!scope.tree.hasChildren(itemId)) {
            scope.ctrl.subscribe(itemId);
        }
    });
};

ConsoleIO.View.Browser.prototype.add = function add(id, name, parentId, icon) {
    if(!this.tree.getParentId(id)){
        if (icon) {
            this.tree.insertNewItem(parentId, id, name, 0, icon, icon, icon);
        } else {
            this.tree.insertNewItem(parentId, id, name);
        }
    }
};

ConsoleIO.View.Browser.prototype.setIcon = function setIcon(id, icon) {
    this.tree.setItemImage(id, icon);
};

ConsoleIO.View.Browser.prototype.deleteItem = function deleteItem(id) {
    this.tree.deleteItem(id);
};
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Status");

ConsoleIO.View.Device.Status = function StatusView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.toolbar = null;
    this.tab = null;
    this.accordion = null;
    this.id = [this.model.name, this.model.serialNumber].join("-");
    this.grids = {};
};


ConsoleIO.View.Device.Status.prototype.render = function render(target) {
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

    this.accordion = this.tab.attachAccordion();
    this.accordion.setIconsPath(ConsoleIO.Settings.iconPath);
    this.accordion.attachEvent("onActive", function (itemId) {
        this.setActive(itemId.replace(this.view.id + '-', ''));
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};

ConsoleIO.View.Device.Status.prototype.destroy = function destroy() {
    this.target.removeTab(this.id);
};


ConsoleIO.View.Device.Status.prototype.clear = function clear() {
    if (this.accordion) {
        ConsoleIO.forEachProperty(this.grids, function (grid) {
            grid.destructor();
        }, this);

        this.grids = {};

        var scope = this;
        this.accordion.forEachItem(function (item) {
            scope.accordion.removeItem(item.getId());
        });
    }
};

ConsoleIO.View.Device.Status.prototype.open = function open(name) {
    var id = this.id + "-" + name;

    if (this.accordion.cells(id)) {
        this.accordion.cells(id).open();
    }
};

ConsoleIO.View.Device.Status.prototype.addLabel = function addLabel(name) {
    var grid,
        id = this.id + "-" + name;

    if (!this.accordion.cells(id)) {
        this.accordion.addItem(id, name);
        this.grids[name] = grid = this.accordion.cells(id).attachGrid();

        grid.setIconsPath(ConsoleIO.Settings.iconPath);
        grid.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('grid'));
        grid.setHeader("Name,Value");
        grid.setInitWidthsP("20,80");
        grid.setColAlign("right,left");
        grid.setColTypes("ro,ro");
        grid.setColSorting("str,str");
        grid.setSkin(ConsoleIO.Constant.THEMES.get('win'));
        grid.init();
    }
};

ConsoleIO.View.Device.Status.prototype.add = function add(name, value, label) {
    var id, grid = this.grids[label];
    if (grid) {
        if (typeof value === 'object') {
            ConsoleIO.forEachProperty(value, function (val, itemName) {
                id = this.getUniqueId(this.id, name);
                grid.addRow(id, [name + '.' + itemName, val]);
                grid.setCellTextStyle(id, 0, "font-weight:bold;");
            }, this);
        } else {
            id = this.getUniqueId(this.id, name);
            grid.addRow(id, [name, value]);
            grid.setCellTextStyle(id, 0, "font-weight:bold;");
        }
    }
};


ConsoleIO.View.Device.Status.prototype.setTabActive = function setTabActive() {
    this.target.setTabActive(this.id);
};

ConsoleIO.View.Device.Status.prototype.setItemState = function setItemState(id, state) {
    if (this.toolbar) {
        this.toolbar.setItemState(id, state);
    }
};


ConsoleIO.View.Device.Status.prototype.getUniqueId = (function () {
    var i = 0;
    return function getUniqueId(id, name) {
        return [id, name, ++i].join('-');
    };
}());

ConsoleIO.View.Device.Status.prototype.getValue = function getValue(id) {
    return this.toolbar.getValue(id);
};

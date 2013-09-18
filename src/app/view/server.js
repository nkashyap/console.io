/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 18/09/13
 * Time: 15:52
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Server");

ConsoleIO.View.Server = function ServerView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.grid = null;
};


ConsoleIO.View.Server.prototype.render = function render(target) {
    this.target = target;
    this.target.setWidth(this.model.width);
    this.target.setHeight(this.model.height);

    this.grid = this.target.attachGrid();
    this.grid.setIconsPath(ConsoleIO.Settings.iconPath);
    this.grid.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('grid'));
    this.grid.setHeader("Name,Value");
    this.grid.setInitWidthsP("40,60");
    this.grid.setColAlign("left,left");
    this.grid.setColTypes("ro,ro");
    this.grid.setColSorting("str,str");
    this.grid.setSkin(ConsoleIO.Constant.THEMES.get('win'));
    this.grid.init();
};


ConsoleIO.View.Server.prototype.update = function update(data) {
    ConsoleIO.forEach(this.grid.getAllRowIds().split(','), function (id) {
        this.grid.deleteRow(id);
    }, this);

    ConsoleIO.forEachProperty(data, function (value, property) {
        this.grid.addRow(property, [property, value]);
        this.grid.setCellTextStyle(property, 0, "font-weight:bold;text-transform: capitalize;");
    }, this);
};

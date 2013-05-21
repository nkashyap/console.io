/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:33
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Preview");

ConsoleIO.View.Device.Preview = function PreviewView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.toolbar = null;
    this.tab = null;
};

ConsoleIO.View.Device.Preview.prototype.render = function render(target) {
    this.target = target;
    this.target.addTab(this.model.name, this.model.name);
    this.tab = this.target.cells(this.model.name);

    this.toolbar = this.tab.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.buttonClick(itemId);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};
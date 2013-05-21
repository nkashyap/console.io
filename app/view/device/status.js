/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 20/05/13
 * Time: 19:28
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Status");

ConsoleIO.View.Device.Status = function StatusView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.toolbar = null;
    this.tab = null;
};

ConsoleIO.View.Device.Status.prototype.render = function render(target){
    this.target = target;
    this.target.addTab(this.model.name, this.model.name);
    this.tab = this.target.cells(this.model.name);

    this.toolbar = this.tab.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function(itemId){
        this.buttonClick(itemId);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};
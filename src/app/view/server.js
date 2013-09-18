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
    this.toolbar = null;
};


ConsoleIO.View.Server.prototype.render = function render(target) {
    this.target = target;
    this.target.setWidth(this.model.width);
    this.target.setHeight(this.model.height);

    this.toolbar = this.target.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};
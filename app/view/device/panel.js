/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Panel");

ConsoleIO.View.Device.Panel = function PanelView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.tabs = null;
};

ConsoleIO.View.Device.Panel.prototype.render = function render(target) {
    this.target = target;
    this.tabs = this.target.attachTabbar();
    this.tabs.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('tab'));
    this.tabs.attachEvent("onTabClick", function (tabId) {
        this.onTabClick(tabId);
    }, this.ctrl);
};
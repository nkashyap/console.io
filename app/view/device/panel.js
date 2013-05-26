/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 20/05/13
 * Time: 15:02
 * To change this template use File | Settings | File Templates.
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
    this.tabs.setImagePath(ConsoleIO.Constraint.IMAGE_URL.get('tab'));
    this.tabs.attachEvent("onTabClick", function (tabId) {
        this.onTabClick(tabId);
    }, this.ctrl);
};

//ConsoleIO.View.Device.Panel.prototype.add = function add(name, isActive){
//    this.tabs.addTab(name, name);
//    if(isActive){
//        this.tabs.setTabActive(name);
//    }
//
//    return this.tabs.cells(name);
//};
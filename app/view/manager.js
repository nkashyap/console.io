/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 12:16
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Manager");

ConsoleIO.View.Manager = function ManagerView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;

    this.target = null;
    this.tabs = null;
};

ConsoleIO.View.Manager.prototype.render = function render(target) {
    this.target = target;
    this.tabs = this.target.attachTabbar();
    this.tabs.setImagePath(ConsoleIO.Constraint.IMAGE_URL.get('tab'));
    this.tabs.enableTabCloseButton(true);

    this.tabs.attachEvent('onTabClose', function (id) {
        this.close(id);
    }, this.ctrl);
};

ConsoleIO.View.Manager.prototype.add = function add(name, isActive) {
    this.tabs.addTab(name, name);
    if (isActive) {
        this.tabs.setTabActive(name);
    }
};

ConsoleIO.View.Manager.prototype.remove = function remove(name) {
    this.tabs.removeTab(name);
};

ConsoleIO.View.Manager.prototype.getContextById = function getContextById(contextId) {
    return this.tabs ? this.tabs.cells(contextId) : null;
};

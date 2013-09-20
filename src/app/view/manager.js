/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
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
    this.tabs.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('tab'));
    this.tabs.enableTabCloseButton(true);

    this.tabs.attachEvent('onTabClose', function (id) {
        this.close(id);
    }, this.ctrl);

    this.tabs.attachEvent("onTabClick", function (tabId) {
        this.onTabClick(tabId);
    }, this.ctrl);
};


ConsoleIO.View.Manager.prototype.add = function add(id, name, isActive) {
    this.tabs.addTab(id, name);
    if (isActive) {
        this.tabs.setTabActive(id);
    }
};

ConsoleIO.View.Manager.prototype.update = function update(id, name) {
    this.tabs.setLabel(id, name);
};

ConsoleIO.View.Manager.prototype.remove = function remove(id) {
    this.tabs.removeTab(id);
};


ConsoleIO.View.Manager.prototype.setActive = function setActive(id) {
    this.tabs.setTabActive(id);
};


ConsoleIO.View.Manager.prototype.getContextById = function getContextById(contextId) {
    return this.tabs ? this.tabs.cells(contextId) : null;
};
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
};

ConsoleIO.View.Manager.prototype.addTabber = function addTabber() {
    if (this.target && !this.tabs) {
        this.tabs = this.target.attachTabbar();
        this.tabs.setImagePath(ConsoleIO.Constraint.IMAGE_URL.get('tab'));
        this.tabs.enableTabCloseButton(true);

        this.tabs.attachEvent('onTabClose', function(id){
            this.close(id);
        }, this.ctrl);
    }
};

ConsoleIO.View.Manager.prototype.add = function add(device, isActive) {
    if (!this.tabs) {
        this.addTabber();
    }

    this.tabs.addTab(device.id, device.name);

    if (isActive) {
        this.tabs.setTabActive(device.id);
    }

    device.render(this.tabs.cells(device.id));
};

ConsoleIO.View.Manager.prototype.remove = function remove(device) {
    this.tabs.removeTab(device.id);
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device");

ConsoleIO.View.Device = function DeviceView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.layout = null;
};

ConsoleIO.View.Device.prototype.render = function render(target) {
    this.target = target;
    this.layout = this.target.attachLayout("2U");
};

ConsoleIO.View.Device.prototype.getContextById = function getContextById(contextId) {
    return this.layout ? this.layout.cells(contextId) : null;
};

ConsoleIO.View.Device.prototype.setTitle = function setTitle(contextId, title) {
    if (this.layout) {
        this.layout.cells(contextId).setText(title);
        this.layout.setCollapsedText(contextId, title);
    }
};
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 07:12
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.App");

ConsoleIO.View.App = function AppView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.layout = null;
};

ConsoleIO.View.App.prototype.render = function render() {
    this.layout = new dhtmlXLayoutObject(this.model.target, this.model.type, ConsoleIO.Constant.THEMES.get('layout'));

    this.layout.cont.obj._offsetTop = 5; // top margin
    this.layout.cont.obj._offsetLeft = 5; // left margin
    this.layout.cont.obj._offsetHeight = -10; // bottom margin
    this.layout.cont.obj._offsetWidth = -10; // right margin

    this.layout.setSizes();
    this.layout.setEffect("resize", true);
    this.layout.attachStatusBar().setText(this.model.status);
};

ConsoleIO.View.App.prototype.getContextById = function getContextById(contextId) {
    return this.layout ? this.layout.cells(contextId) : null;
};

ConsoleIO.View.App.prototype.setTitle = function setTitle(contextId, title) {
    if (this.layout) {
        this.layout.cells(contextId).setText(title);
        this.layout.setCollapsedText(contextId, title);
    }
};
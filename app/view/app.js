/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.App");

ConsoleIO.View.App = function AppView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.layout = null;
    this.statusBar = null;
};

ConsoleIO.View.App.prototype.render = function render() {
    this.layout = new dhtmlXLayoutObject(this.model.target, this.model.type, ConsoleIO.Constant.THEMES.get('layout'));

    this.layout.cont.obj._offsetTop = 5; // top margin
    this.layout.cont.obj._offsetLeft = 5; // left margin
    this.layout.cont.obj._offsetHeight = -10; // bottom margin
    this.layout.cont.obj._offsetWidth = -10; // right margin

    this.layout.setSizes();
    this.layout.setEffect("resize", true);

    this.statusBar = this.layout.attachStatusBar();

    this.offline();
};

ConsoleIO.View.App.prototype.getContextById = function getContextById(contextId) {
    return this.layout ? this.layout.cells(contextId) : null;
};

ConsoleIO.View.App.prototype.online = function online() {
    var icon = '<img src="' + ConsoleIO.Settings.iconPath + 'online.png" class="status">';
    this.statusBar.setText(icon + this.model.status);
};

ConsoleIO.View.App.prototype.offline = function offline() {
    var icon = '<img src="' + ConsoleIO.Settings.iconPath + 'offline.png" class="status">';
    this.statusBar.setText(icon + this.model.status);
};

ConsoleIO.View.App.prototype.notify = function notify(data) {
    console.log(data);
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
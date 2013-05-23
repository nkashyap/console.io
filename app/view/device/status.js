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
    this.id = [this.model.name, this.model.guid].join("-");
    this.container = ConsoleIO.Service.DHTMLXHelper.createElement({
        attr: { 'class': 'status-contents' }
    });
};

ConsoleIO.View.Device.Status.prototype.render = function render(target) {
    this.target = target;
    this.target.addTab(this.id, this.model.name);
    this.target.setContent(this.id, this.container);
    this.target.setTabActive(this.id);
    this.tab = this.target.cells(this.id);

    this.toolbar = this.tab.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.buttonClick(itemId);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};

ConsoleIO.View.Device.Status.prototype.clear = function clear() {
    while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
    }
};

ConsoleIO.View.Device.Status.prototype.add = function add(data) {
    var tag = 'pre',
        messagePreview,
        message = ConsoleIO.Service.DHTMLXHelper.stripBrackets(data);

    // for Opera and Maple browser
    message = message.replace(/%20/img, " ");
    messagePreview = prettyPrintOne(message);

    ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: tag,
        attr: {
            'class': 'console type-status'
        },
        prop: {
            innerHTML: (messagePreview || '.')
        },
        target: this.container
    });
};
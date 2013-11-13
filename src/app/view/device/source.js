/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Source");

ConsoleIO.View.Device.Source = function SourceView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.toolbar = null;
    this.layout = null;
    this.tab = null;
    this.id = [this.model.name, this.model.serialNumber].join("-");
};


ConsoleIO.View.Device.Source.prototype.render = function render(target) {
    this.target = target;
    this.target.addTab(this.id, this.model.name);
    this.tab = this.target.cells(this.id);
    this.layout = this.tab.attachLayout("2U");

    this.toolbar = this.getContextById(this.ctrl.context.source).attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);

    this.toolbar.attachEvent("onStateChange", function (itemId, state) {
        this.onButtonClick(itemId, state);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};

ConsoleIO.View.Device.Source.prototype.destroy = function destroy() {
    this.target.removeTab(this.id);
};


ConsoleIO.View.Device.Source.prototype.getContextById = function getContextById(contextId) {
    return this.layout ? this.layout.cells(contextId) : null;
};


ConsoleIO.View.Device.Source.prototype.setTabActive = function setTabActive() {
    this.target.setTabActive(this.id);
};

ConsoleIO.View.Device.Source.prototype.setTitle = function setTitle(contextId, title) {
    if (this.layout) {
        this.layout.cells(contextId).setText(title);
        this.layout.setCollapsedText(contextId, title);
    }
};

ConsoleIO.View.Device.Source.prototype.setItemState = function setItemState(name, state) {
    if (this.toolbar) {
        var item = ConsoleIO.Model.DHTMLX.ToolBarItem[name];
        if (item) {
            this.toolbar.setItemState(item.id, state);
        }
    }
};
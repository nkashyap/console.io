/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 07:26
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Editor");

ConsoleIO.View.Editor = function EditorView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;

    this.container = null;
    this.textArea = null;
    this.target = null;
    this.toolbar = null;

    this.createElements();
};

ConsoleIO.View.Editor.prototype.render = function render(target) {
    this.target = target;
    this.target.attachObject(this.container);

    if (this.model.toolbar) {
        this.toolbar = this.target.attachToolbar();
        this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
        this.toolbar.attachEvent("onClick", function (itemId) {
            this.onButtonClick(itemId);
        }, this.ctrl);

        this.toolbar.attachEvent("onStateChange", function (itemId, state) {
            this.onButtonClick(itemId, state);
        }, this.ctrl);

        ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
    }
};

ConsoleIO.View.Editor.prototype.createElements = function createElements() {
    this.container = ConsoleIO.Service.DHTMLXHelper.createElement({
        attr: { 'class': 'editor' },
        target: document.body
    });

    this.textArea = ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: 'textarea',
        attr: { placeholder: this.model.placeholder },
        target: this.container
    });
};
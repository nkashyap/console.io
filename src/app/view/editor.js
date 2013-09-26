/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
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

ConsoleIO.View.Editor.prototype.destroy = function destroy() {
    this.container.removeChild(this.textArea);
    this.container.parentNode.removeChild(this.container);
    if (this.toolbar) {
        this.toolbar.unload();
    }
};


ConsoleIO.View.Editor.prototype.fileList = function fileList(data) {
    var scope = this;
    this.toolbar.forEachListOption('open', function (id) {
        scope.toolbar.removeListOption('open', id);
    });

    ConsoleIO.forEach(data, function (file, index) {
        scope.toolbar.addListOption('open', 'script-' + file, index, 'button', file, ConsoleIO.Constant.ICONS.JAVASCRIPT);
    }, this);
};

ConsoleIO.View.Editor.prototype.addScript = function addScript(data) {
    var id = 'script-' + data.name,
        index = this.toolbar.getAllListOptions('open').length;

    this.toolbar.removeListOption('open', id);
    this.toolbar.addListOption('open', id, index, 'button', data.name, ConsoleIO.Constant.ICONS.JAVASCRIPT);
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

ConsoleIO.View.Editor.prototype.toggleButton = function toggleButton(id, state) {
    if (this.toolbar) {
        if (state) {
            this.toolbar.enableItem(id);
        } else {
            this.toolbar.disableItem(id);
        }
    }
};


ConsoleIO.View.Editor.prototype.setItemText = function setItemText(name, text) {
    if (this.toolbar) {
        var item = ConsoleIO.Model.DHTMLX.ToolBarItem[name];
        if (item) {
            this.toolbar.setItemText(item.id, text || item.text);
        }
    }
};

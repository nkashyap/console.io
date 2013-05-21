/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Console");

ConsoleIO.View.Device.Console = function ConsoleView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.tab = null;
    this.toolbar = null;
    this.container = null;
    this.createElements();
};

ConsoleIO.View.Device.Console.prototype.render = function render(target) {
    this.target = target;
    this.target.addTab(this.model.name, this.model.name);
    this.target.setTabActive(this.model.name);
    this.target.setContent(this.model.name, this.container);
    this.tab = this.target.cells(this.model.name);

    this.toolbar = this.tab.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.buttonClick(itemId);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};

ConsoleIO.View.Device.Console.prototype.createElements = function createElements() {
    this.container = ConsoleIO.Service.DHTMLXHelper.createElement({
        attr: { 'class': 'console-contents' }
    });
};

ConsoleIO.View.Device.Console.prototype.stripBrackets = function stripBrackets(data) {
    var last = data.length - 1;
    if (data.charAt(0) === '[' && data.charAt(last) === ']') {
        return data.substring(1, last);
    }
    return data;
};

ConsoleIO.View.Device.Console.prototype.add = function add(data) {
    var tag = 'code',
        css = data.type,
        stackMessage,
        messagePreview,
        message = this.stripBrackets(data.message);

    // check if asset failed
    if (data.type === "assert") {
        var asset = this.stripBrackets(message).split(",");
        if (asset[0].toLowerCase() !== "true") {
            css = "assert-failed";
        }
    }

    // for Opera and Maple browser
    message = message.replace(/%20/img, " ");

    // switch to pre mode if message contain object
    if (message.indexOf("{") > -1 && message.indexOf("}") > -1) {
        tag = 'pre';
    }

    messagePreview = prettyPrintOne(message);

    if (data.stack) {
        var stack = data.stack.split(",")
            .join("\n")
            .replace(/"/img, '')
            .replace(/%20/img, ' ');

        stackMessage = this.stripBrackets(stack);
        messagePreview += '\n' + prettyPrintOne(stackMessage);
    }

    if (['assert', 'dir', 'dirxml', 'error', 'trace'].indexOf(data.type) > -1) {
        tag = 'pre';
    }

//    if (this.filters.indexOf(css) > -1) {
//        css += ' hidden';
//    }

    ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: tag,
        attr: {
            'class': 'console type-' + css
        },
        prop: {
            innerHTML: (messagePreview || '.')
        },
        target: this.container,
        insert: 'top'
    });
};
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
    this.id = [this.model.name, this.model.guid].join("-");
    this.container = ConsoleIO.Service.DHTMLXHelper.createElement({
        attr: { 'class': 'console-contents' }
    });
};

ConsoleIO.View.Device.Console.prototype.render = function render(target) {
    this.target = target;
    this.target.addTab(this.id, this.model.name);
    this.target.setContent(this.id, this.container);
    this.tab = this.target.cells(this.id);

    this.toolbar = this.tab.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.buttonClick(itemId);
    }, this.ctrl);

    this.toolbar.attachEvent("onStateChange", function (itemId, state) {
        this.buttonClick(itemId, state);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};

ConsoleIO.View.Device.Console.prototype.getElementData = function getElementData(data) {
    var tag = 'code',
        css = data.type,
        stackMessage,
        messagePreview,
        message = ConsoleIO.Service.DHTMLXHelper.stripBrackets(data.message);

    // check if asset failed
    if (data.type === "assert") {
        var asset = ConsoleIO.Service.DHTMLXHelper.stripBrackets(message).split(",");
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

        stackMessage = ConsoleIO.Service.DHTMLXHelper.stripBrackets(stack);
        messagePreview += '\n' + prettyPrintOne(stackMessage);
    }

    if (['assert', 'dir', 'dirxml', 'error', 'trace'].indexOf(data.type) > -1) {
        tag = 'pre';
    }

    return {
        tag: tag,
        className: 'console type-' + css,
        message: (messagePreview || '.')
    }
};

ConsoleIO.View.Device.Console.prototype.add = function add(data) {
    var element = this.getElementData(data);

    ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: element.tag,
        attr: {
            'class': element.className
        },
        prop: {
            innerHTML: element.message
        },
        target: this.container,
        insert: 'top'
    });
};

ConsoleIO.View.Device.Console.prototype.addBatch = function addBatch(store) {
    var fragment = document.createDocumentFragment();

    ConsoleIO.forEach(store, function (item) {
        var element = this.getElementData(item);

        ConsoleIO.Service.DHTMLXHelper.createElement({
            tag: element.tag,
            attr: {
                'class': element.className
            },
            prop: {
                innerHTML: element.message
            },
            target: fragment,
            insert: 'top'
        });

    }, this);

    this.container.insertBefore(fragment, this.container.firstElementChild || this.container.firstChild);
};
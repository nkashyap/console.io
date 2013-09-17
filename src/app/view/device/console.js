/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Console");

ConsoleIO.View.Device.Console = function ConsoleView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.tab = null;
    this.toolbar = null;
    this.id = [this.model.name, this.model.serialNumber].join("-");
    this.container = ConsoleIO.Service.DHTMLXHelper.createElement({
        attr: {
            id: 'console-' + this.id
        }
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
        this.onButtonClick(itemId);
    }, this.ctrl);

    this.toolbar.attachEvent("onStateChange", function (itemId, state) {
        this.onButtonClick(itemId, state);
    }, this.ctrl);

    this.toolbar.attachEvent("onEnter", function (itemId, value) {
        this.applySearch(value);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};

ConsoleIO.View.Device.Console.prototype.getElementData = function getElementData(data) {

    data.message = unescape(data.message);

    var tag = 'code',
        css = data.type,
        origin = data.origin,
        originClass,
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

    if (origin) {
        origin = data.origin.replace(/(\/|:|\.)/igm, '');
        originClass = "content: 'iframe:" + data.origin + "'; position: absolute; top: 0px; right: 0px; padding: 2px 8px; " +
            "font-size: 12px; color: lightgrey; " +
            "background-color: rgba(0, 0, 0, 0.6); " +
            "font-family: Monaco,Menlo,Consolas,'Courier New',monospace;";

        ConsoleIO.deleteCSSRule('.' + origin + ":before");
        ConsoleIO.addCSSRule('.' + origin + ":before", originClass);
    }

    return {
        tag: tag,
        className: 'console type-' + css + (origin ? ' ' + origin : ''),
        message: (messagePreview || '.')
    };
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

    this.removeOverflowElement();
};

ConsoleIO.View.Device.Console.prototype.addBatch = function addBatch(store) {
    if (store.length > 0) {
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
                insert: 'bottom'
            });
        }, this);

        this.container.insertBefore(fragment, this.container.firstElementChild || this.container.firstChild);
        this.removeOverflowElement();
    }
};

ConsoleIO.View.Device.Console.prototype.getHTML = function getHTML() {
    return this.container.innerHTML;
};

ConsoleIO.View.Device.Console.prototype.getValue = function getValue(id) {
    return this.toolbar.getValue(id);
};

ConsoleIO.View.Device.Console.prototype.clear = function clear() {
    while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
    }
};

ConsoleIO.View.Device.Console.prototype.removeOverflowElement = function removeOverflowElement() {
    var length = this.container.childElementCount || this.container.children.length;
    while (length > ConsoleIO.Settings.pageSize.active) {
        this.container.removeChild(this.container.lastElementChild || this.container.lastChild);
        length--;
    }
};

ConsoleIO.View.Device.Console.prototype.setItemState = function setItemState(id, state) {
    if (this.toolbar) {
        this.toolbar.setItemState(id, state);
    }
};

ConsoleIO.View.Device.Console.prototype.setValue = function setValue(id, text) {
    if (this.toolbar) {
        this.toolbar.setValue(id, text);
    }
};

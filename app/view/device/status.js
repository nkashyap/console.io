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
        attr: {
            'class': 'status-contents',
            id: this.id
        }
    });
    this.labels = {};
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
        this.onButtonClick(itemId);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);
};

ConsoleIO.View.Device.Status.prototype.clear = function clear() {
    while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
    }
};

ConsoleIO.View.Device.Status.prototype.addLabel = function addLabel(name) {
    var id = this.id + '-' + name,
        labelDiv = ConsoleIO.Service.DHTMLXHelper.createElement({
            attr: {
                'class': 'label'
            },
            prop: {
                id: id
            },
            target: this.container
        });

    ConsoleIO.Service.DHTMLXHelper.createElement({
        attr: {
            'class': 'title'
        },
        prop: {
            innerHTML: name
        },
        target: labelDiv
    });

    this.labels[id] = labelDiv;
};

ConsoleIO.View.Device.Status.prototype.add = function add(name, value, label) {
    var property = ConsoleIO.Service.DHTMLXHelper.createElement({
        attr: {
            'class': 'property'
        },
        target: this.labels[this.id + '-' + label]
    });

    ConsoleIO.Service.DHTMLXHelper.createElement({
        attr: {
            'class': 'name'
        },
        prop: {
            innerHTML: name
        },
        target: property
    });

    ConsoleIO.Service.DHTMLXHelper.createElement({
        attr: {
            'class': 'value'
        },
        prop: {
            innerHTML: value
        },
        target: property
    });
};
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:33
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Preview");

ConsoleIO.View.Device.Preview = function PreviewView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.toolbar = null;
    this.tab = null;
    this.dhxWins = null;
    this.previewFrame = null;
    this.id = [this.model.name, this.model.guid].join("-");
};

ConsoleIO.View.Device.Preview.prototype.render = function render(target) {
    this.target = target;
    this.target.addTab(this.id, this.model.name);
    this.tab = this.target.cells(this.id);

    this.toolbar = this.tab.attachToolbar();
    this.toolbar.setIconsPath(ConsoleIO.Settings.iconPath);
    this.toolbar.attachEvent("onClick", function (itemId) {
        this.onButtonClick(itemId);
    }, this.ctrl);

    this.toolbar.attachEvent("onStateChange", function (itemId, state) {
        this.onButtonClick(itemId, state);
    }, this.ctrl);

    ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.toolbar, this.toolbar);

    this.previewFrame = ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: 'iframe',
        attr: {
            height: '100%',
            width: '100%'
        },
        target: document.body
    });

    this.dhxWins = new dhtmlXWindows();
    this.dhxWins.enableAutoViewport(false);
    this.dhxWins.attachViewportTo(document.body);
    this.dhxWins.setSkin(ConsoleIO.Constraint.THEMES.get('win'));
    this.dhxWins.setImagePath(ConsoleIO.Constraint.IMAGE_URL.get('win'));
};

ConsoleIO.View.Device.Preview.prototype.toggleButton = function toggleButton(id, state) {
    if (this.toolbar) {
        if (state) {
            this.toolbar.enableItem(id);
        } else {
            this.toolbar.disableItem(id);
        }
    }
};

ConsoleIO.View.Device.Preview.prototype.preview = function preview(data) {
    if (this.dhxWins) {
        this.previewFrame.src = "data:text/html," + escape(data.content);

        var win = this.dhxWins.createWindow("preview", 20, 30, 800, 600);
        win.setText("Preview");
        win.button('park').hide();
        win.keepInViewport(true);
        win.centerOnScreen();
        win.setModal(true);
        win.attachObject(this.previewFrame);
    }
};

ConsoleIO.View.Device.Preview.prototype.screenShot = function screenShot(data) {
    if (this.dhxWins) {
        this.previewFrame.src = data.screen;

        var win = this.dhxWins.createWindow("screen", 20, 30, 800, 600);
        win.setText("ScreenShot");
        win.button('park').hide();
        win.keepInViewport(true);
        win.centerOnScreen();
        win.setModal(true);
        win.attachObject(this.previewFrame);
    }
};
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.View.Device.HTML");

ConsoleIO.View.Device.HTML = function HTMLView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;
    this.target = null;
    this.toolbar = null;
    this.previewToolbar = null;
    this.tab = null;
    this.dhxWins = null;
    this.previewFrame = null;
    this.image = null;
    this.id = [this.model.name, this.model.serialNumber].join("-");
};


ConsoleIO.View.Device.HTML.prototype.render = function render(target) {
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

    this.previewBar = ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: 'div',
        attr: {
            width: '100%'
        }
    });

    this.previewFrame = ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: 'iframe',
        attr: {
            height: '100%',
            width: '100%',
            style: 'display:none;'
        },
        target: document.body
    });

    this.image = ConsoleIO.Service.DHTMLXHelper.createElement({
        tag: 'img',
        target: document.body
    });

    this.dhxWins = new dhtmlXWindows();
    this.dhxWins.enableAutoViewport(true);
    this.dhxWins.attachViewportTo(document.body);
    this.dhxWins.setSkin(ConsoleIO.Constant.THEMES.get('win'));
    this.dhxWins.setImagePath(ConsoleIO.Constant.IMAGE_URL.get('win'));
};

ConsoleIO.View.Device.HTML.prototype.destroy = function destroy() {
    document.body.removeChild(this.previewFrame);
    document.body.removeChild(this.image);
    this.dhxWins.unload();
    this.target.removeTab(this.id);
};


ConsoleIO.View.Device.HTML.prototype.toggleButton = function toggleButton(name, state) {
    var item = ConsoleIO.Model.DHTMLX.ToolBarItem[name];
    if (this.toolbar && item) {
        if (state) {
            this.toolbar.enableItem(item.id);
        } else {
            this.toolbar.disableItem(item.id);
        }
    }
};

ConsoleIO.View.Device.HTML.prototype.show = function show() {
    this.previewFrame.style.display = 'block';
    this.tab.attachObject(this.previewFrame);
};

ConsoleIO.View.Device.HTML.prototype.hide = function hide() {
    this.previewFrame.style.display = 'none';
    this.tab.detachObject(this.previewFrame);
};

ConsoleIO.View.Device.HTML.prototype.preview = function preview(data) {
    this.unbind();
    /* jshint ignore:start */
    this.previewFrame.src = "javascript:false;";
    /* jshint ignore:end */
    ConsoleIO.async(function () {
        var document = this.previewFrame.contentWindow.document;
        document.head.innerHTML = (data.style || '') + (data.links || '');
        document.body.innerHTML = data.body;
        this.bind();
    }, this);
};

ConsoleIO.View.Device.HTML.prototype.bind = function bind() {
    var win = this.previewFrame.contentWindow || this.previewFrame.contentDocument;
    if (win.document) {
        ConsoleIO.forEachProperty(this.ctrl.events, function (fn, name) {
            ConsoleIO.addEventListener(win.document.body, name, fn);
        }, this.ctrl);
    }
};

ConsoleIO.View.Device.HTML.prototype.unbind = function unbind() {
    var win = this.previewFrame.contentWindow || this.previewFrame.contentDocument;
    if (win.document) {
        ConsoleIO.forEachProperty(this.ctrl.events, function (fn, name) {
            ConsoleIO.removeEventListener(win.document.body, name, fn);
        }, this.ctrl);
    }
};

ConsoleIO.View.Device.HTML.prototype.screenShot = function screenShot(data) {
    if (this.dhxWins) {
        if (data.screen) {
            this.image.src = data.screen;

            var win = this.dhxWins.createWindow("screen", 0, 0, 900, 700);
            win.setText("Capture");
            win.button('park').hide();
            win.keepInViewport(true);
            win.setModal(true);
            win.centerOnScreen();
            win.button("close").attachEvent("onClick", function () {
                win.detachObject(this.image);
                win.close();
            }, this);

            win.attachObject(this.image);
        } else {
            alert("Sorry!, Console.IO was unable to capture screen. Check console for more details.");
        }
    }
};


ConsoleIO.View.Device.HTML.prototype.setMode = function setMode(mode) {
    if (mode === ConsoleIO.Model.DHTMLX.ToolBarItem.Preview.id) {
        var target = document.querySelector('.dhx_tabcontent_zone > [tab_id=' + this.id + ']');
        if (!this.previewToolbar && target) {
            target.insertBefore(this.previewBar, document.querySelector('.dhx_tabcontent_zone > [tab_id=' + this.id + '] [ida=dhxMainCont]'));

            this.previewToolbar = new dhtmlXToolbarObject(this.previewBar, ConsoleIO.Settings.theme);
            this.previewToolbar.setIconsPath(ConsoleIO.Settings.iconPath);
            this.previewToolbar.attachEvent("onClick", function (itemId) {
                this.onPreviewButtonClick(itemId, true);
            }, this.ctrl);

            this.previewToolbar.attachEvent("onStateChange", function (itemId, state) {
                this.onPreviewButtonClick(itemId, state);
            }, this.ctrl);

            this.previewToolbar.attachEvent("onEnter", function (itemId, value) {
                ConsoleIO.Settings.triggerInterval = value;
            }, this.ctrl);

            ConsoleIO.Service.DHTMLXHelper.populateToolbar(this.model.previewToolbar, this.previewToolbar);
            this.previewBar.className = 'dhx_toolbar_base_18_dhx_skyblue in_tabbarcell';
        }
    } else {
        if (this.previewToolbar) {
            this.previewToolbar.unload();
            this.previewToolbar = null;
            this.previewBar.parentNode.removeChild(this.previewBar);
        }
    }
};

ConsoleIO.View.Device.HTML.prototype.setTabActive = function setTabActive() {
    this.target.setTabActive(this.id);
};

ConsoleIO.View.Device.HTML.prototype.setItemState = function setItemState(name, state) {
    if (this.toolbar) {
        var item = ConsoleIO.Model.DHTMLX.ToolBarItem[name];
        if (item) {
            this.toolbar.setItemState(item.id, state);
        }
    }
};
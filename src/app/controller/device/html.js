/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Device.HTML");

ConsoleIO.App.Device.HTML = function HTMLController(parent, model) {
    var toolBarModel = ConsoleIO.Model.DHTMLX.ToolBarItem;

    this.parent = parent;
    this.model = model;

    this.view = new ConsoleIO.View.Device.HTML(this, {
        name: "HTML",
        serialNumber: this.model.serialNumber,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Source,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Preview,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.WordWrap,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Beautify,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SelectAll,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Copy,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.ScreenShot
        ],
        previewToolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.TriggerLabel,
            ConsoleIO.Model.DHTMLX.ToolBarItem.TriggerInterval,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Click,
            ConsoleIO.Model.DHTMLX.ToolBarItem.DoubleClick,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.KeyPress,
            ConsoleIO.Model.DHTMLX.ToolBarItem.KeyDown,
            ConsoleIO.Model.DHTMLX.ToolBarItem.KeyUp,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.MouseMove,
            ConsoleIO.Model.DHTMLX.ToolBarItem.MouseOver,
            ConsoleIO.Model.DHTMLX.ToolBarItem.MouseOut,
            ConsoleIO.Model.DHTMLX.ToolBarItem.MouseEnter,
            ConsoleIO.Model.DHTMLX.ToolBarItem.MouseLeave
        ]
    });

    this.editor = new ConsoleIO.App.Editor(this, {});

    this.activeMode = toolBarModel.Source.pressed ? toolBarModel.Source.id : toolBarModel.Preview.id;
    this.events = {};

    ConsoleIO.Service.Socket.on('device:htmlDocument:' + this.model.serialNumber, this.addContent, this);
    ConsoleIO.Service.Socket.on('device:htmlContent:' + this.model.serialNumber, this.addContent, this);
    ConsoleIO.Service.Socket.on('device:screenShot:' + this.model.serialNumber, this.screenShot, this);
};


ConsoleIO.App.Device.HTML.prototype.render = function render(target) {
    this.view.render(target);
    this.editor.render(this.view.tab);
    this.switchMode(this.activeMode);
};

ConsoleIO.App.Device.HTML.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:htmlDocument:' + this.model.serialNumber, this.addContent, this);
    ConsoleIO.Service.Socket.off('device:htmlContent:' + this.model.serialNumber, this.addContent, this);
    ConsoleIO.Service.Socket.off('device:screenShot:' + this.model.serialNumber, this.screenShot, this);
    this.editor = this.editor.destroy();
    this.view = this.view.destroy();
};


ConsoleIO.App.Device.HTML.prototype.activate = function activate(state) {
    if (state && ConsoleIO.Settings.reloadTabContentWhenActivated) {
        this.editor.setOption('lineWrapping', this.parent.wordWrap);
        this.refresh();
    }
};

ConsoleIO.App.Device.HTML.prototype.addContent = function addContent(data) {
    if (this.activeMode === ConsoleIO.Model.DHTMLX.ToolBarItem.Source.id) {
        this.editor.setValue(data);
    } else {
        this.view.preview(data);
    }
};

ConsoleIO.App.Device.HTML.prototype.buildSelector = function buildSelector(element, childSelector) {

    if (element.tagName.toLowerCase() === 'body') {
        return childSelector || 'body';
    }

    childSelector = !!childSelector ? ' ' + childSelector : '';

    var thisElementSelector = element.tagName;

    if (!!element.id) {
        // Use the id. Should be unique, so no need to go further.
        thisElementSelector = thisElementSelector + '#' + element.id;
        return thisElementSelector + childSelector;
    }

    // use an nth-child selector.
    if (element.parentElement.childElementCount > 1) {
        var elementPosition = 1, prevSibling = element.previousElementSibling;
        while (!!prevSibling) {
            elementPosition++;
            prevSibling = prevSibling.previousElementSibling;
        }

        thisElementSelector += ':nth-child(' + elementPosition + ')';
    }

    return this.buildSelector(element.parentElement, thisElementSelector + childSelector);
};

ConsoleIO.App.Device.HTML.prototype.screenShot = function screenShot(data) {
    this.view.toggleButton('ScreenShot', true);
    this.view.screenShot(data);
};

ConsoleIO.App.Device.HTML.prototype.sendEvent = function sendEvent(e) {
    this.intervals = this.intervals || {};
    if (!this.intervals[e.type]) {
        var selector = this.buildSelector(e.srcElement),
            event = {
                serialNumber: this.model.serialNumber,
                constructor: e.constructor.name
            };

        if (!!selector) {
            ConsoleIO.forEachProperty(e, function (value, property) {
                if (e.hasOwnProperty(property)) {
                    if (typeof value !== 'object') {
                        event[property] = value;
                    } else if (property === 'srcElement') {
                        event.srcElement = '$!' + selector;
                    } else if (value !== null && typeof value === 'object' && !!value.tagName) {
                        var subSelector = this.buildSelector(value);
                        if (subSelector) {
                            event[property] = '$!' + subSelector;
                        }
                    }
                }
            }, this);

            ConsoleIO.Service.Socket.emit('remoteEvent', event);
        }

        this.intervals[e.type] = ConsoleIO.async(function () {
            window.clearTimeout(this.intervals[e.type]);
            delete this.intervals[e.type];
        }, this, ConsoleIO.Settings.triggerInterval);
    }
};

ConsoleIO.App.Device.HTML.prototype.refresh = function refresh() {
    if (this.activeMode === ConsoleIO.Model.DHTMLX.ToolBarItem.Source.id) {
        ConsoleIO.Service.Socket.emit('htmlSource', {
            serialNumber: this.model.serialNumber,
            beautify: this.parent.beautify
        });
    } else {
        ConsoleIO.Service.Socket.emit('htmlPreview', {
            serialNumber: this.model.serialNumber
        });
    }
};

ConsoleIO.App.Device.HTML.prototype.switchMode = function switchMode(mode) {
    this.activeMode = mode;

    this.setItemState('Preview', (mode === 'preview'));
    this.setItemState('Source', (mode === 'source'));
    this.view.toggleButton('WordWrap', (mode === 'source'));
    this.view.toggleButton('Beautify', (mode === 'source'));
    this.view.toggleButton('SelectAll', (mode === 'source'));
    this.view.toggleButton('Copy', (mode === 'source'));

    if (this.activeMode === ConsoleIO.Model.DHTMLX.ToolBarItem.Source.id) {
        this.view.hide();
        this.editor.show();
    } else {
        this.editor.hide();
        this.view.show();
    }

    this.view.setMode(this.activeMode);
    this.refresh();
};

ConsoleIO.App.Device.HTML.prototype.setTabActive = function setTabActive() {
    this.view.setTabActive();
};

ConsoleIO.App.Device.HTML.prototype.setItemState = function setItemState(id, state) {
    this.view.setItemState(id, state);
};

ConsoleIO.App.Device.HTML.prototype.onPreviewButtonClick = function onPreviewButtonClick(btnId, state) {
    btnId = btnId.toLowerCase();

    this.view.unbind();

    if (state) {
        if (!this.events[btnId]) {
            var scope = this;
            this.events[btnId] = function (e) {
                scope.sendEvent(e);
            };
        }
    } else {
        delete this.events[btnId];
    }

    this.view.bind();
};

ConsoleIO.App.Device.HTML.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        switch (btnId) {
            case 'source':
            case 'preview':
                this.switchMode(btnId);
                break;
            case 'screenShot':
                this.view.toggleButton('ScreenShot', false);

                ConsoleIO.Service.Socket.emit('captureScreen', {
                    serialNumber: this.model.serialNumber
                });

                ConsoleIO.async(function () {
                    this.view.toggleButton('ScreenShot', true);
                }, this, 10000);

                break;
            default:
                this.parent.parent.parent.server.update({
                    status: 'Unhandled event',
                    btnId: btnId,
                    state: state
                });
                break;
        }
    }
};
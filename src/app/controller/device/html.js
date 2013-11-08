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
            ConsoleIO.Model.DHTMLX.ToolBarItem.ScreenShot,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Connect
        ]
    });
    this.editor = new ConsoleIO.App.Editor(this, {});

    this.activeMode = ConsoleIO.Model.DHTMLX.ToolBarItem.Source.pressed ? 'source' : 'preview';
    this.remoteControl = false;

    var scope = this;
    this.events = {
        click: function onclick(e) {
            scope.sendEvent(e);
        }
//        mousemove: function mousemove(e) {
//            scope.sendEvent(e);
//        },
//        mouseover: function mouseover(e) {
//            scope.sendEvent(e);
//        },
//        mouseout: function mouseout(e) {
//            scope.sendEvent(e);
//        }
    };

    ConsoleIO.Service.Socket.on('device:htmlDocument:' + this.model.serialNumber, this.addContent, this);
    ConsoleIO.Service.Socket.on('device:htmlContent:' + this.model.serialNumber, this.addContent, this);
    ConsoleIO.Service.Socket.on('device:screenShot:' + this.model.serialNumber, this.screenShot, this);
};


ConsoleIO.App.Device.HTML.prototype.render = function render(target) {
    this.view.render(target);
    this.editor.render(this.view.tab);
    this.view.toggleButton('Connect', this.activeMode === 'preview');
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
    if (this.activeMode === 'source') {
        this.view.hide();
        this.editor.show();
        this.editor.setValue(data);
    } else {
        this.editor.hide();
        this.view.preview(data);
        this.view.show();
    }
};

ConsoleIO.App.Device.HTML.prototype.buildSelector = function buildSelector(element, childSelector) {

    if (element.tagName.toLowerCase() === 'body') {
        return childSelector;
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
        var selector = this.buildSelector(e.srcElement);
        if (!!selector) {
            ConsoleIO.Service.Socket.emit('remoteEvent', {
                serialNumber: this.model.serialNumber,
                event: e.constructor.name,
                type: e.type,
                selector: selector
            });
        }

        this.intervals[e.type] = ConsoleIO.async(function () {
            window.clearTimeout(this.intervals[e.type]);
            delete this.intervals[e.type];
        }, this, 500);
    }
};

ConsoleIO.App.Device.HTML.prototype.refresh = function refresh() {
    if (this.activeMode === 'source') {
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


ConsoleIO.App.Device.HTML.prototype.setTabActive = function setTabActive() {
    this.view.setTabActive();
};

ConsoleIO.App.Device.HTML.prototype.setItemState = function setItemState(id, state) {
    this.view.setItemState(id, state);
};


ConsoleIO.App.Device.HTML.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        switch (btnId) {
            case 'source':
                this.activeMode = 'source';
                this.setItemState('Preview', false);

                this.view.toggleButton('WordWrap', true);
                this.view.toggleButton('Beautify', true);
                this.view.toggleButton('SelectAll', true);
                this.view.toggleButton('Copy', true);
                this.view.toggleButton('Connect', false);

                this.refresh();
                break;
            case 'preview':
                this.activeMode = 'preview';
                this.setItemState('Source', false);

                this.view.toggleButton('WordWrap', false);
                this.view.toggleButton('Beautify', false);
                this.view.toggleButton('SelectAll', false);
                this.view.toggleButton('Copy', false);
                this.view.toggleButton('Connect', true);

                this.refresh();
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
            case 'connect':
                this.remoteControl = state;
                if (this.remoteControl) {
                    this.view.bind();
                } else {
                    this.view.unbind();
                }
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
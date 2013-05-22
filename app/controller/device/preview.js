/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Preview");

ConsoleIO.App.Device.Preview = function PreviewController(parent, model) {
    this.parent = parent;
    this.model = model;

    this.view = new ConsoleIO.View.Device.Preview(this, {
        name: "Preview",
        guid: this.model.guid,
        toolbar: [
            { id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: 'refresh.gif', tooltip: 'Refresh' },
            { id: 'wordwrap', type: 'twoState', text: 'Word-Wrap', imgEnabled: 'word_wrap.gif', tooltip: 'Word Wrap', enabled: true }
        ]
    });
    this.editor = new ConsoleIO.App.Editor(this, {});

    ConsoleIO.Service.Socket.on('device:content:' + this.model.guid, this.add, this);
};

ConsoleIO.App.Device.Preview.prototype.render = function render(target) {
    this.view.render(target);
    this.editor.render(this.view.tab);
};

ConsoleIO.App.Device.Preview.prototype.activate = function activate(state) {
    if (state) {
        this.reloadContent();
    }
};

ConsoleIO.App.Device.Preview.prototype.add = function add(data) {
    this.editor.add(data);
};

ConsoleIO.App.Device.Preview.prototype.reloadContent = function reloadContent() {
    ConsoleIO.Service.Socket.emit('reloadHTML', this.model.guid);
};

ConsoleIO.App.Device.Preview.prototype.buttonClick = function buttonClick(btnId, state) {
    console.log('buttonClick', btnId, state);
    switch (btnId) {
        case 'refresh':
            this.reloadContent();
            break;
        case 'wordwrap':
            this.editor.setOption('lineWrapping', state);
            break;
    }
};
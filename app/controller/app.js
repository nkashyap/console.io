/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 07:09
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App");

ConsoleIO.App = function AppController() {
    this.context = {
        browser: "a",
        editor: "b",
        manager: "c"
    };

    this.view = new ConsoleIO.View.App(this, {
        target: document.body,
        type: "3U",
        status: "Welcome to Console.IO"
    });

    this.browser = new ConsoleIO.App.Browser(this, {
        title: 'Device List',
        contextId: 'browser',
        width: 200,
        height: 250,
        toolbar: [{ id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: '', tooltip: 'Refresh' }]
    });

    this.editor = new ConsoleIO.App.Editor(this, {
        id: 'editor',
        title: 'Editor',
        placeholder: 'Write javascript code to execute on remote client',
        codeMirror: {
            mode: 'javascript',
            readOnly: false
        },
        toolbar: [
            { id: 'back', type: 'select', text: 'Back', opts: [
                ['id1', 'obj', 'option1', 'img1'],
                ['sep01', 'sep', '', '']
            ], imgEnabled: '', imgDisabled: '', tooltip: '' },
            { id: 'forward', type: 'select', text: 'Forward', opts: [
                ['id1', 'obj', 'option1', 'img1'],
                ['sep01', 'sep', '', '']
            ], imgEnabled: '', imgDisabled: '', tooltip: '' },
            { type: 'separator' },
            { id: 'clear', type: 'button', text: 'Clear', imgEnabled: '', tooltip: '' },
            { type: 'separator' },
            { id: 'send', type: 'button', text: 'Send', imgEnabled: '', tooltip: 'Send command' }
        ]
    });

    this.manager = new ConsoleIO.App.Manager(this, {
        title: 'Manager',
        contextId: 'manager'
    });
};

ConsoleIO.App.prototype.render = function render() {
    this.view.render();
    this.browser.render(this.view.getContextById(this.context.browser));
    this.editor.render(this.view.getContextById(this.context.editor));
    this.manager.render(this.view.getContextById(this.context.manager));
};

ConsoleIO.App.prototype.setTitle = function setTitle(name, title) {
    this.view.setTitle(this.context[name], title);
};
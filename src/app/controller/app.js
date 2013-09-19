/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App");

ConsoleIO.App = function AppController() {
    this.context = {
        browser: "a",
        editor: "b",
        server: "c",
        manager: "d"
    };

    this.view = new ConsoleIO.View.App(this, {
        target: document.body,
        type: "4U",
        status: "<a style='float:left;' target='_blank' href='http://nkashyap.github.io/console.io/'>" +
            "Welcome to Console.IO</a><span style='float:right;'>" +
            "Author: Nisheeth Kashyap, Email: nisheeth.k.kashyap@gmail.com</span>"
    });

    this.browser = new ConsoleIO.App.Browser(this, {
        title: 'Device List',
        contextId: 'browser',
        width: 200,
        height: 250,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Refresh
        ]
    });

    this.editor = new ConsoleIO.App.Editor(this, {
        contextId: 'editor',
        title: 'Editor',
        placeholder: 'Write javascript code to execute on remote client',
        codeMirror: {
            mode: 'javascript',
            readOnly: false
        },
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Execute,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Open,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Save,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Clear,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Cut,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Copy,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Paste,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SelectAll,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Undo,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Redo,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.WordWrap,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Beautify
        ]
    });

    this.server = new ConsoleIO.App.Server(this, {
        title: 'Server',
        contextId: 'server',
        width: 200,
        height: 250
    });

    this.manager = new ConsoleIO.App.Manager(this, {
        title: 'Manager',
        contextId: 'manager'
    });

    ConsoleIO.Service.Socket.on('user:fileList', this.fileList, this);
    ConsoleIO.Service.Socket.on('user:fileContent', this.fileContent, this);
    ConsoleIO.Service.Socket.on('user:fileSaved', this.fileSaved, this);
};


ConsoleIO.App.prototype.render = function render() {
    this.view.render();
    this.browser.render(this.view.getContextById(this.context.browser));
    this.editor.render(this.view.getContextById(this.context.editor));
    this.server.render(this.view.getContextById(this.context.server));
    this.manager.render(this.view.getContextById(this.context.manager));
};


ConsoleIO.App.prototype.fileList = function fileList(files) {
    this.editor.fileList(files);
};

ConsoleIO.App.prototype.fileSaved = function fileSaved(file) {
    this.editor.fileName = file.name;
    this.editor.addScript(file);
};

ConsoleIO.App.prototype.fileContent = function fileContent(data) {
    this.editor.add(data);
};


ConsoleIO.App.prototype.setTitle = function setTitle(name, title) {
    this.view.setTitle(this.context[name], title);
};


ConsoleIO.App.prototype.getActiveDeviceSerialNumber = function getActiveDeviceSerialNumber() {
    return this.manager.getActiveDeviceSerialNumber();
};
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 18/05/13
 * Time: 21:17
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Editor");
ConsoleIO.namespace("ConsoleIO.App.Editor.CopyDocument");

ConsoleIO.App.Editor = function EditorController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.model.codeMirror = ConsoleIO.extend({
        mode: {
            name: "htmlmixed",
            scriptTypes: [
                {matches: /\/x-handlebars-template|\/x-mustache/i,
                    mode: null},
                {matches: /(text|application)\/(x-)?vb(a|script)/i, mode: "vbscript"}
            ]
        },
        readOnly: true,
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        statementIndent: true,
        lineWrapping: false,
        styleActiveLine: true,
        highlightSelectionMatches: true,
        continueComments: "Enter",
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-Enter": "submit",
            "Ctrl-Q": "toggleComment"
        }
    }, this.model.codeMirror);
    this.fileName = null;
    this.view = new ConsoleIO.View.Editor(this, {
        guid: this.model.guid,
        placeholder: this.model.placeholder,
        toolbar: this.model.toolbar
    });
};

ConsoleIO.App.Editor.prototype.render = function render(target) {
    if (this.parent.setTitle) {
        this.parent.setTitle(this.model.contextId || this.model.guid, this.model.title);
    }
    this.editor = CodeMirror.fromTextArea(this.view.textArea, this.model.codeMirror);
    this.view.render(target);

    var scope = this;
    this.editor.on("change", function () {
        scope.updateButtonState();
    });
};

ConsoleIO.App.Editor.prototype.listScripts = function listScripts(data) {
    this.view.listScripts(data);
};

ConsoleIO.App.Editor.prototype.addScript = function addScript(data) {
    this.view.addScript(data);
};

ConsoleIO.App.Editor.prototype.getDoc = function getDoc() {
    return this.editor.getDoc();
};

ConsoleIO.App.Editor.prototype.add = function add(data) {
    if (data.name) {
        this.fileName = data.name;
    }

    this.editor.setValue(data.content);
};

ConsoleIO.App.Editor.prototype.setOption = function setOption(option, value) {
    this.editor.setOption(option, value);
};

ConsoleIO.App.Editor.prototype.selectAll = function selectAll() {
    var doc = this.getDoc();
    doc.setSelection({line: 0, ch: 0}, {line: doc.lineCount(), ch: 0});
};

ConsoleIO.App.Editor.prototype.copy = function copy() {
    ConsoleIO.App.Editor.CopyDocument = this.getDoc().getSelection();
    this.updateButtonState();
};

ConsoleIO.App.Editor.prototype.cut = function cut() {
    this.copy();
    this.editor.replaceSelection("");
    this.updateButtonState();
};

ConsoleIO.App.Editor.prototype.paste = function paste() {
    var doc = this.getDoc();
    if (ConsoleIO.App.Editor.CopyDocument) {
        if (doc.somethingSelected()) {
            doc.replaceSelection(ConsoleIO.App.Editor.CopyDocument);
        } else {
            this.editor.setValue(this.editor.getValue() + ConsoleIO.App.Editor.CopyDocument);
        }

        doc.setCursor({line: doc.lineCount(), ch: 0});
    }

    this.updateButtonState();
};

ConsoleIO.App.Editor.prototype.undo = function undo() {
    this.editor.undo();
    this.updateButtonState();
};

ConsoleIO.App.Editor.prototype.redo = function redo() {
    this.editor.redo();
    this.updateButtonState();
};

ConsoleIO.App.Editor.prototype.clear = function clear() {
    this.editor.setValue("");
    this.getDoc().markClean();
    this.fileName = null;
    //this.getDoc().clearHistory();
    this.updateButtonState();
};

ConsoleIO.App.Editor.prototype.save = function save(saveAs) {
    var fileName = null,
        cmd = this.editor.getValue();

    if (this.fileName) {
        fileName = saveAs ? prompt("Save file as:", "") : this.fileName;
    } else {
        fileName = prompt("Enter a new file name:", "");
    }

    if (fileName !== null) {
        ConsoleIO.Service.Socket.emit('saveScript', {
            content: cmd,
            name: fileName
        });
    }
};

ConsoleIO.App.Editor.prototype.command = function command() {
    var cmd = this.editor.getValue();
    if (cmd) {
        ConsoleIO.Service.Socket.emit('execute', {
            guid: this.parent.getActiveDeviceGuid(),
            code: cmd
        });
    }
};

ConsoleIO.App.Editor.prototype.updateButtonState = function updateButtonState() {
    if (this.model.toolbar) {
        var history = this.getDoc().historySize();
        this.view.toggleButton('undo', (history.undo > 0));
        this.view.toggleButton('redo', (history.redo > 0));
        this.view.toggleButton('save', !this.getDoc().isClean());
    }
};

ConsoleIO.App.Editor.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (btnId.indexOf('script-') === 0) {
        ConsoleIO.Service.Socket.emit('loadScript', {
            name: btnId.split("-")[1]
        });
        return;
    }

    switch (btnId) {
        case 'cut':
            this.cut();
            break;
        case 'copy':
            this.copy();
            break;
        case 'paste':
            this.paste();
            break;
        case 'selectAll':
            this.selectAll();
            break;
        case 'undo':
            this.undo();
            break;
        case 'redo':
            this.redo();
            break;
        case 'clear':
            this.clear();
            break;
        case 'wordwrap':
            this.setOption('lineWrapping', state);
            break;
        case 'execute':
            this.command();
            break;
        case 'save':
            this.save(false);
            break;
        case 'saveAs':
            this.save(true);
            break;
    }
};
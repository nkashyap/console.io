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
    this.editor.on("change", function onChange() {
        scope.setUnDoRedoState();
    });
};

ConsoleIO.App.Editor.prototype.getDoc = function getDoc() {
    return this.editor.getDoc();
};

ConsoleIO.App.Editor.prototype.add = function add(data) {
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
    this.setUnDoRedoState();
};

ConsoleIO.App.Editor.prototype.cut = function cut() {
    this.copy();
    this.editor.replaceSelection("");
    this.setUnDoRedoState();
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

    this.setUnDoRedoState();
};

ConsoleIO.App.Editor.prototype.undo = function undo() {
    this.editor.undo();
    this.setUnDoRedoState();
};

ConsoleIO.App.Editor.prototype.redo = function redo() {
    this.editor.redo();
    this.setUnDoRedoState();
};

ConsoleIO.App.Editor.prototype.clear = function clear() {
    this.editor.setValue("");
    //this.getDoc().clearHistory();
    this.setUnDoRedoState();
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

ConsoleIO.App.Editor.prototype.setUnDoRedoState = function setUnDoRedoState() {
    if (this.model.toolbar) {
        var history = this.getDoc().historySize();
        this.view.toggleButton('undo', (history.undo > 0));
        this.view.toggleButton('redo', (history.redo > 0));
    }
};

ConsoleIO.App.Editor.prototype.onButtonClick = function onButtonClick(btnId, state) {
    console.log(btnId, state);
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
        case 'open':
        case 'save':
        case 'saveAs':
            break;
    }
};
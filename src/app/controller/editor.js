/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 */

ConsoleIO.namespace("ConsoleIO.App.Editor");
ConsoleIO.namespace("ConsoleIO.App.Editor.CopyDocument");

ConsoleIO.App.Editor = function EditorController(parent, model) {
    var scope = this;
    this.parent = parent;
    this.model = model;
    this.model.codeMirror = ConsoleIO.extend({
        mode: {
            name: "htmlmixed",
            scriptTypes: [
                {matches: /\/x-handlebars-template|\/x-mustache/i, mode: null},
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
            "Ctrl-Q": "toggleComment",
            "Shift-Ctrl-Q": function (cm) {
                scope.foldCode(cm.getCursor());
            }
        },
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    }, this.model.codeMirror);
    this.fileName = null;
    this.fileCanBeSaved = false;

    this.view = new ConsoleIO.View.Editor(this, {
        serialNumber: this.model.serialNumber,
        placeholder: this.model.placeholder,
        toolbar: this.model.toolbar
    });
};


ConsoleIO.App.Editor.prototype.render = function render(target) {
    this.setTitle();
    this.editor = CodeMirror.fromTextArea(this.view.textArea, this.model.codeMirror);
    this.view.render(target);

    var scope = this;
    this.editor.on("change", function () {
        if (scope.fileName) {
            if (scope.fileCanBeSaved && !scope.getDoc().isClean()) {
                scope.setTitle(scope.fileName, 'UNSAVED');
            } else {
                scope.fileCanBeSaved = true;
                scope.setTitle(scope.fileName);
                scope.getDoc().markClean();
            }
        }

        scope.updateButtonState();
    });
};

ConsoleIO.App.Editor.prototype.destroy = function destroy() {
    this.view = this.view.destroy();
};


ConsoleIO.App.Editor.prototype.foldCode = function foldCode(where) {
    this.editor.foldCode(where, this.model.codeMirror.mode === 'javascript' ? CodeMirror.braceRangeFinder : CodeMirror.tagRangeFinder);
};

ConsoleIO.App.Editor.prototype.fileList = function fileList(data) {
    this.view.fileList(data);
};

ConsoleIO.App.Editor.prototype.addScript = function addScript(data) {
    this.view.addScript(data);
    this.setTitle(this.fileName, 'SAVED');
    this.fileCanBeSaved = false;
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
    if (this.fileName && !this.getDoc().isClean()) {
        if (confirm("File is not saved!\nAre you sure you want to close it?")) {
            this.close();
        }
    } else {
        this.close();
    }
};

ConsoleIO.App.Editor.prototype.close = function close() {
    this.fileName = null;
    this.editor.setValue("");
    this.getDoc().markClean();
    this.getDoc().clearHistory();
    this.updateButtonState();
    this.setTitle();
    this.view.setItemText(ConsoleIO.Model.DHTMLX.ToolBarItem.Clear.id, ConsoleIO.Model.DHTMLX.ToolBarItem.Clear.text);
};

ConsoleIO.App.Editor.prototype.save = function save(saveAs) {
    var fileName = null,
        content = this.editor.getValue();

    if (this.fileName) {
        fileName = saveAs ? prompt("Save file as:", "") : this.fileName;
    } else {
        fileName = prompt("Enter a new file name:", "");
    }

    if (fileName !== null) {
        ConsoleIO.Service.Socket.emit('writeFile', {
            content: content,
            name: fileName
        });
    }
};

ConsoleIO.App.Editor.prototype.command = function command() {
    var content = this.editor.getValue();
    if (content) {
        ConsoleIO.Service.Socket.emit('execute', {
            serialNumber: this.parent.getActiveDeviceSerialNumber(),
            code: content
        });
    }
};

ConsoleIO.App.Editor.prototype.updateButtonState = function updateButtonState() {
    if (this.model.toolbar) {
        var history = this.getDoc().historySize();
        this.view.toggleButton('undo', (history.undo > 0));
        this.view.toggleButton('redo', (history.redo > 0));

        if (this.fileName) {
            this.view.toggleButton('save', (this.fileCanBeSaved && !this.getDoc().isClean()));
        } else {
            this.view.toggleButton('save', !this.getDoc().isClean());
        }
    }
};


ConsoleIO.App.Editor.prototype.setValue = function setValue(data) {
    if (data.name) {
        this.fileName = data.name;
        this.setTitle(this.fileName);
        this.view.setItemText(ConsoleIO.Model.DHTMLX.ToolBarItem.Clear.id, 'Close');
    }

    var content = data.content.replace(/%20/img, " "),
        lastLine;
    if (!data.start || data.start === 0) {
        this.editor.setValue(content);
    } else if (data.start > 0) {
        lastLine = this.editor.lastLine();
        this.editor.replaceRange(content, {
            line: lastLine,
            ch: this.editor.getLine(lastLine).length
        });
    }
};

ConsoleIO.App.Editor.prototype.setTitle = function setTitle() {
    if (this.parent.setTitle) {
        var title = [this.model.title].concat(ConsoleIO.toArray(arguments));
        this.parent.setTitle(this.model.contextId || this.model.serialNumber, title.join(' : '));
    }
};

ConsoleIO.App.Editor.prototype.setOption = function setOption(option, value) {
    this.editor.setOption(option, value);
};


ConsoleIO.App.Editor.prototype.getDoc = function getDoc() {
    return this.editor.getDoc();
};


ConsoleIO.App.Editor.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (btnId.indexOf('script-') === 0) {
        ConsoleIO.Service.Socket.emit('readFile', {
            name: btnId.split("-")[1]
        });
        return;
    }

    switch (btnId) {
        case 'beautify':
            ConsoleIO.Service.Socket.emit('beautify', {
                name: this.fileName || '',
                content: this.editor.getValue()
            });
            break;
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
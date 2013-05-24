/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 18/05/13
 * Time: 21:17
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Editor");

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
};

ConsoleIO.App.Editor.prototype.setOption = function setOption(option, value) {
    this.editor.setOption(option, value);
};

ConsoleIO.App.Editor.prototype.add = function add(data) {
    this.editor.setValue(data.content);
};

ConsoleIO.App.Editor.prototype.buttonClick = function buttonClick(btnId, state) {
    console.log(btnId, state);
};
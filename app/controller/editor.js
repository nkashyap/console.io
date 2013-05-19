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
    this.model.codeMirror = ConsoleIO.merge(this.model.codeMirror, {
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
        lineWrapping: true,
        styleActiveLine: true,
        highlightSelectionMatches: true,
        continueComments: "Enter",
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-Enter": "submit",
            "Ctrl-Q": "toggleComment"
        }
    });

    this.view = new ConsoleIO.View.Editor(this, {
        id: this.model.id,
        placeholder: this.model.placeholder,
        toolbar: this.model.toolbar
    });
};

ConsoleIO.App.Editor.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.id, this.model.title);
    this.editor = CodeMirror.fromTextArea(this.view.textArea, this.model.codeMirror);
    this.view.render(target);
};

ConsoleIO.App.Editor.prototype.click = function click(itemId) {
    console.log(itemId);
};
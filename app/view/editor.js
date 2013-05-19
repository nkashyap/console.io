/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 07:26
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Editor");

ConsoleIO.View.Editor = function EditorView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;

    this.container = null;
    this.textArea = null;
    this.target = null;
    this.toolbar = null;

    this.createElements();
};

ConsoleIO.View.Editor.prototype.render = function render(target){
    this.target = target;
    this.target.attachObject(this.container);

    if(this.model.toolbar){
        this.addToolbar();
    }
};

ConsoleIO.View.Editor.prototype.addToolbar = function addToolbar(items) {
    if(this.target && !this.toolbar){
        this.toolbar = this.target.attachToolbar();
        //this.toolbar.setIconsPath("../common/imgs/");

        ConsoleIO.forEach(items || this.model.toolbar, function(item, index){
            switch(item.type){
                case 'button':
                    this.addButton(item.id, index, item.text, item.imgEnabled, item.imgDisabled);
                    break;
                case 'separator':
                    this.addSeparator('separator+' + index, index);
                    break;
                case 'twoState':
                    this.addButtonTwoState(item.id, index, item.text, item.imgEnabled, item.imgDisabled);
                    break;
                case 'select':
                    this.addButtonSelect(item.id, index, item.text, item.opts, item.imgEnabled, item.imgDisabled);
                    break;
                case 'text':
                    this.addText(item.id, index, item.text);
                    break;
            }
        }, this.toolbar);

        this.toolbar.attachEvent("onClick", function(itemId){
            this.click(itemId);
        }, this.ctrl);
    }
};

ConsoleIO.View.Editor.prototype.createElements = function createElements() {
    this.container = document.createElement('div');
    this.textArea = document.createElement('textarea');

    this.container.setAttribute('class', 'editor');
    this.container.setAttribute('id', this.model.id);

    if (this.model.placeholder) {
        this.textArea.setAttribute('placeholder', this.model.placeholder);
    }

    this.container.appendChild(this.textArea);
    document.body.appendChild(this.container);
};
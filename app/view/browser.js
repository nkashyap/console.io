/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 11:49
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Browser");

ConsoleIO.View.Browser = function BrowserView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;

    this.tree = null;
    this.target = null;
    this.toolbar = null;
};

ConsoleIO.View.Browser.prototype.render = function render(target){
    this.target = target;
    this.target.setWidth(this.model.width);
    this.target.setHeight(this.model.height);

    this.addTree();

    if(this.model.toolbar){
        this.addToolbar();
    }
};

ConsoleIO.View.Browser.prototype.addTree = function addTree() {
    if(this.target && !this.tree){
        this.tree = this.target.attachTree();
        this.tree.setImagePath(ConsoleIO.Constraint.IMAGE_URL.get('tree'));
        this.tree.enableHighlighting(true);
        this.tree.enableTreeImages(true);
        this.tree.enableTreeLines(true);
        this.tree.enableIEImageFix(true);

        var scope = this;
        this.tree.attachEvent("onDblClick", function(itemId){
            if(!scope.tree.hasChildren(itemId)){
                this.subscribe(itemId);
            }
        }, this.ctrl);
    }
};

ConsoleIO.View.Browser.prototype.addToolbar = function addToolbar(items) {
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
            this.buttonClick(itemId);
        }, this.ctrl);
    }
};

ConsoleIO.View.Browser.prototype.add = function add(id, name, parentId) {
    if(this.tree){
        this.tree.insertNewItem(parentId, id, name);
    }
};
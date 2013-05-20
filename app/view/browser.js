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
};

ConsoleIO.View.Browser.prototype.render = function render(target){
    this.target = target;
    this.target.setWidth(this.model.width);
    this.target.setHeight(this.model.height);

    this.addTree();
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
                this.click(itemId);
            }
        }, this.ctrl);
    }
};

ConsoleIO.View.Browser.prototype.add = function add(id, name, parentId) {
    if(this.tree){
        this.tree.insertNewItem(parentId, id, name);
    }
};
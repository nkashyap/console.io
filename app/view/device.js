/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 12:17
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Device");

ConsoleIO.View.Device = function DeviceView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;

    this.target = null;
    this.layout = null;

    this.file = {
        toolbar: null,
        browser: null
    };
};

ConsoleIO.View.Device.prototype.render = function render(target){
    this.target = target;
    this.layout = this.target.attachLayout("2U");

    //this.addFileExplorer(this.layout.cells("a"));
};

ConsoleIO.View.Device.prototype.getContextById = function getContextById(contextId){
    return this.layout ? this.layout.cells(contextId) : null;
};

//ConsoleIO.View.Device.prototype.addFileExplorer = function addFileExplorer(target){
//    target.setWidth(200);
//    target.setText("Files");
//    target.setCollapsedText("a", "Files");
//
//    this.file.toolbar = target.attachToolbar();
//    this.file.toolbar.addButton("reload", 0, "Reload", "save_as.gif");
//
//
//    this.file.browser = target.attachTree();
//    this.file.browser.setImagePath(ConsoleIO.Constraint.IMAGE_URL.get('tree'));
//    this.file.browser.enableHighlighting(1);
//    this.file.browser.enableTreeImages(1);
//
//    //this.file.browser.insertNewItem(0,1,'Console.IO',0, 0, 0, 0, 'TOP,CHILD');
//    //this.file.browser.insertNewItem(0,1,'Console.IO',0, 0, 0, 0, 'TOP,CHILD');
//
//    this.file.browser.attachEvent("onClick", function(itemId){
//        this.click(itemId);
//    }, this.ctrl);
//
//};
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:29
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Explorer");

ConsoleIO.App.Explorer = function ExplorerController(parent, model){
    this.parent = parent;
    this.model = model;
    this.view = new ConsoleIO.View.Explorer(this, this.model);

    ConsoleIO.Service.Socket.on('device:files', ConsoleIO.App.Explorer.prototype.add, this);

    this.refresh();
};

ConsoleIO.App.Explorer.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.id, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Explorer.prototype.add = function add(data) {
    console.log('add', data);
};

ConsoleIO.App.Explorer.prototype.clear = function clear() {
    console.log('clear');
};

ConsoleIO.App.Explorer.prototype.buttonClick = function buttonClick(btnId) {
    console.log('buttonClick', btnId);
    if(btnId === 'refresh'){
        this.refresh();
    }
};

ConsoleIO.App.Explorer.prototype.refresh = function refresh() {
    this.clear();
    ConsoleIO.Service.Commands.listFiles(this.model.name);
};

ConsoleIO.App.Explorer.prototype.viewFile = function viewFile(itemId) {
    ConsoleIO.Service.Commands.viewFile(this.model.name, itemId);
};
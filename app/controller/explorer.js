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
};

ConsoleIO.App.Explorer.prototype.render = function render(target) {
    this.view.render(target);
};

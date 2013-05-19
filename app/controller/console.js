/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Console");

ConsoleIO.App.Console = function ConsoleController(parent, model){
    this.parent = parent;
    this.model = model;

    this.view = new ConsoleIO.View.Console(this, this.model);
};

ConsoleIO.App.Console.prototype.render = function render(target) {
    this.view.render(target);
};

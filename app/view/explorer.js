/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:29
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Explorer");

ConsoleIO.View.Explorer = function ExplorerView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;

    this.target = null;
};

ConsoleIO.View.Explorer.prototype.render = function render(target){
    this.target = target;
};
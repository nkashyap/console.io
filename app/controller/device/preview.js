/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Preview");

ConsoleIO.App.Preview = function PreviewController(parent, model){
    this.parent = parent;
    this.model = model;

    this.view = new ConsoleIO.View.Preview(this, this.model);
};

ConsoleIO.App.Preview.prototype.render = function render(target) {
    this.view.render(target);
};

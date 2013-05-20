/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Source");

ConsoleIO.App.Source = function SourceController(parent, model){
    this.parent = parent;
    this.model = model;

    this.view = new ConsoleIO.View.Source(this, this.model);
};

ConsoleIO.App.Source.prototype.render = function render(target) {
    this.view.render(target);
};

/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */
ConsoleIO.namespace("ConsoleIO.View.Device.Source");

ConsoleIO.View.Device.Source = function SourceView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;

    this.target = null;
};

ConsoleIO.View.Device.Source.prototype.render = function render(target){
    this.target = target;
};
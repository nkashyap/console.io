/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:33
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.View.Device.Preview");

ConsoleIO.View.Device.Preview = function PreviewView(ctrl, model) {
    this.ctrl = ctrl;
    this.model = model;

    this.target = null;
};

ConsoleIO.View.Device.Preview.prototype.render = function render(target){
    this.target = target;
};
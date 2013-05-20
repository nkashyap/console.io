/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Console");

ConsoleIO.App.Device.Console = function ConsoleController(parent, model){
    this.parent = parent;
    this.model = model;
    this.title = "Console";

    this.view = new ConsoleIO.View.Device.Console(this, {
        toolbar: [{ id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: 'refresh.gif', tooltip: 'Refresh' }]
    });
};

ConsoleIO.App.Device.Console.prototype.render = function render(target) {
    this.view.render(target);
};

ConsoleIO.App.Device.Console.prototype.buttonClick = function buttonClick(btnId) {
    console.log('buttonClick', btnId);
    if(btnId === 'refresh'){
        this.refresh();
    }
};
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 20/05/13
 * Time: 19:28
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Status");

ConsoleIO.App.Device.Status = function StatusController(parent, model) {
    this.parent = parent;
    this.model = model;

    this.view = new ConsoleIO.View.Device.Status(this, {
        name: "Status",
        guid: this.model.guid,
        toolbar: [
            { id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: 'refresh.gif', tooltip: 'Refresh' }
        ]
    });
};

ConsoleIO.App.Device.Status.prototype.render = function render(target) {
    this.view.render(target);
};

ConsoleIO.App.Device.Status.prototype.buttonClick = function buttonClick(btnId) {
    console.log('buttonClick', btnId);
    if (btnId === 'refresh') {
        this.refresh();
    }
};
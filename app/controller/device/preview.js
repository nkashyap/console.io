/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Preview");

ConsoleIO.App.Device.Preview = function PreviewController(parent, model){
    this.parent = parent;
    this.model = model;
    this.title = "Preview";

    this.view = new ConsoleIO.View.Device.Preview(this, {
        toolbar: [{ id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: 'refresh.gif', tooltip: 'Refresh' }]
    });

    this.editor = new ConsoleIO.App.Editor(this, {
        codeMirror: {
            mode: 'javascript'
        }
    });
};

ConsoleIO.App.Device.Preview.prototype.render = function render(target) {
    this.view.render(target);
    this.editor.render(target);
};

ConsoleIO.App.Device.Preview.prototype.buttonClick = function buttonClick(btnId) {
    console.log('buttonClick', btnId);
    if(btnId === 'refresh'){
        this.refresh();
    }
};
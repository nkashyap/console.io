/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Source");

ConsoleIO.App.Device.Source = function SourceController(parent, model){
    this.parent = parent;
    this.model = model;
    this.title = "Source";

    this.view = new ConsoleIO.View.Device.Source(this, {
        toolbar: [{ id: 'refresh', type: 'button', text: 'Refresh', imgEnabled: 'refresh.gif', tooltip: 'Refresh' }]
    });

    this.editor = new ConsoleIO.App.Editor(this, {
        codeMirror: {
            mode: 'javascript'
        }
    });
};

ConsoleIO.App.Device.Source.prototype.render = function render(target) {
    this.view.render(target);
    this.editor.render(target);
};

ConsoleIO.App.Device.Source.prototype.buttonClick = function buttonClick(btnId) {
    console.log('buttonClick', btnId);
    if(btnId === 'refresh'){
        this.refresh();
    }
};
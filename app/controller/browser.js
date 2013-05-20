/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 18/05/13
 * Time: 20:43
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Browser");

ConsoleIO.App.Browser = function BrowserController(parent, model){
    this.parent = parent;
    this.model = model;
    this.store = {
        os: [],
        browser: []
    };

    this.view = new ConsoleIO.View.Browser(this, this.model);

    ConsoleIO.Service.Socket.on('user:devices', ConsoleIO.App.Browser.prototype.add, this);
    ConsoleIO.Service.Socket.on('device:registered', ConsoleIO.App.Browser.prototype.add, this);
    ConsoleIO.Service.Socket.on('device:offline', function(data){
        console.log('device:offline', data);
    }, this);
    ConsoleIO.Service.Socket.on('device:online', function(data){
        console.log('device:online', data);
    }, this);
};

ConsoleIO.App.Browser.prototype.add = function add(data) {
    var name = data.browser + '-' + data.version;

    if(this.store.os.indexOf(data.os) === -1){
        this.view.add(data.os, data.os, 0);
        this.store.os.push(data.os);
    }

    if(this.store.browser.indexOf(name) === -1){
        this.view.add(data.browser, data.browser, data.os);
        this.view.add(name, data.version, data.browser);
        this.store.browser.push(name);
    }

    this.view.add(data.name, data.browser +'|'+ data.number, name);
};

ConsoleIO.App.Browser.prototype.render = function render(target) {
    this.parent.setTitle(this.model.contextId || this.model.id, this.model.title);
    this.view.render(target);
};

ConsoleIO.App.Browser.prototype.buttonClick = function buttonClick(btnId) {
    console.log('buttonClick', btnId);
};

ConsoleIO.App.Browser.prototype.subscribe = function subscribe(itemId) {
    ConsoleIO.Service.Socket.emit('subscribe', itemId);
};
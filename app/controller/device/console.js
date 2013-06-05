/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 19/05/13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.App.Device.Console");

ConsoleIO.App.Device.Console = function ConsoleController(parent, model) {
    this.parent = parent;
    this.model = model;
    this.active = true;
    this.paused = false;
    this.filters = [];
    this.searchRegex = null;
    this.store = {
        added: [],
        queue: []
    };
    this.view = new ConsoleIO.View.Device.Console(this, {
        name: "Console",
        guid: this.model.guid,
        toolbar: [
            ConsoleIO.Model.DHTMLX.ToolBarItem.Reload,
            ConsoleIO.Model.DHTMLX.ToolBarItem.PlayPause,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Clear,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Export,
            ConsoleIO.Model.DHTMLX.ToolBarItem.PageSize,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.SearchText,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Search,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.FilterLabel,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Info,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Log,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Warn,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Debug,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Error
        ]
    });

    ConsoleIO.Service.Socket.on('device:console:' + this.model.guid, this.add, this);
};

ConsoleIO.App.Device.Console.prototype.render = function render(target) {
    this.view.render(target);
};

ConsoleIO.App.Device.Console.prototype.activate = function activate(state) {
    this.active = state;
    this.addBatch();
};

ConsoleIO.App.Device.Console.prototype.add = function add(data) {
    if (this.active && !this.paused) {
        this.store.added.push(data);
        this.view.add(data);
    } else {
        this.store.queue.push(data);
    }
};

ConsoleIO.App.Device.Console.prototype.addBatch = function addBatch() {
    if (this.active && !this.paused) {
        this.view.addBatch(this.store.queue);
        this.store.added = this.store.added.concat(this.store.queue);
        this.store.queue = [];
    }
};

ConsoleIO.App.Device.Console.prototype.applySearch = function applySearch(value) {
    this.searchRegex = typeof value === 'undefined' ? this.view.getValue('searchText') : value;
    if (this.searchRegex) {
        if (this.searchRegex[0] !== "\\") {
            this.searchRegex = new RegExp("\\b" + this.searchRegex, "img");
        } else {
            this.searchRegex = new RegExp(this.searchRegex, "img");
        }
    }
    this.view.clear();
    this.view.addBatch(this.store.added);
};

ConsoleIO.App.Device.Console.prototype.isSearchFiltered = function isSearchFiltered(data) {
    return this.searchRegex ? data.message.search(this.searchRegex) > -1 : true;
};

ConsoleIO.App.Device.Console.prototype.isFiltered = function isFiltered(data) {
    return this.filters.length === 0 || (this.filters.length > 0 && this.filters.indexOf(data.type) > -1);
};

ConsoleIO.App.Device.Console.prototype.onPageSizeChanged = function onPageSizeChanged(btnId) {
    ConsoleIO.Settings.pageSize.active = btnId.split("-")[1];
    this.view.clear();
    this.view.addBatch(this.store.added);
};

ConsoleIO.App.Device.Console.prototype.onFilterChanged = function onFilterChanged(btnId, state) {
    var filter = btnId.split("-")[1],
        index = this.filters.indexOf(filter);

    if (state && index === -1) {
        this.filters.push(filter);
    } else if (index > -1) {
        this.filters.splice(index, 1);
    }

    this.view.clear();
    this.view.addBatch(this.store.added);
};

ConsoleIO.App.Device.Console.prototype.onButtonClick = function onButtonClick(btnId, state) {
    if (!this.parent.onButtonClick(this, btnId, state)) {
        if (btnId.indexOf('pagesize-') === 0) {
            this.onPageSizeChanged(btnId);
            this.notify();
        } else if (btnId.indexOf('filter-') === 0) {
            this.onFilterChanged(btnId, state);
            this.notify();
        } else {
            switch (btnId) {
                case 'playPause':
                    this.paused = state;
                    this.addBatch();
                    this.notify();
                    break;
                case 'clear':
                    this.view.clear();
                    this.notify(true);
                    break;
                case 'search':
                    this.applySearch();
                    this.notify();
                    break;
                case 'export':
                    ConsoleIO.Service.Socket.emit('exportHTML', {
                        guid: this.model.guid,
                        name: this.model.name,
                        content: this.view.getHTML()
                    });
                    break;
            }
        }
    }
};

ConsoleIO.App.Device.Console.prototype.notify = function notify(clearAll) {
    ConsoleIO.Service.Socket.emit('pluginControl', {
        guid: this.model.guid,
        pageSize: ConsoleIO.Settings.pageSize.active,
        filters: this.filters,
        search: this.view.getValue('searchText'),
        paused: this.paused,
        clear: !!clearAll
    });
};
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 12:17
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
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

    var config = this.model.web.config;

    if (typeof config.pageSize !== 'undefined') {
        ConsoleIO.Settings.pageSize.active = config.pageSize;
    }

    if (typeof config.paused !== 'undefined') {
        this.paused = this.model.web.config.paused;
    }

    if (typeof config.filters !== 'undefined') {
        this.filters = this.model.web.config.filters;
    }

    if (typeof config.search !== 'undefined') {
        this.searchRegex = this.model.web.config.search;
    }

    this.view = new ConsoleIO.View.Device.Console(this, {
        name: "Console",
        serialNumber: this.model.serialNumber,
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
            ConsoleIO.Model.DHTMLX.ToolBarItem.Log,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Info,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Debug,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Separator,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Warn,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Trace,
            ConsoleIO.Model.DHTMLX.ToolBarItem.Error
        ]
    });

    ConsoleIO.Service.Socket.on('device:console:' + this.model.serialNumber, this.add, this);
};


ConsoleIO.App.Device.Console.prototype.render = function render(target) {
    this.view.render(target);
    this.view.setItemState('playPause', this.paused);
    this.view.setValue('searchText', this.searchRegex);

    if (this.searchRegex) {
        this.applySearch(this.searchRegex);
    }

    ConsoleIO.forEach(this.filters, function (filter) {
        this.view.setItemState('filter-' + filter, true);
    }, this);
};

ConsoleIO.App.Device.Console.prototype.destroy = function destroy() {
    ConsoleIO.Service.Socket.off('device:console:' + this.model.serialNumber, this.add, this);
    this.view = this.view.destroy();
};


ConsoleIO.App.Device.Console.prototype.activate = function activate(state) {
    this.active = state;
    this.addBatch();
};

ConsoleIO.App.Device.Console.prototype.add = function add(data) {
    if (this.active && !this.paused) {
        this.store.added.push(data);

        if (!this.isFiltered(data) || !this.isSearchFiltered(data)) {
            return false;
        }

        this.view.add(data);
    } else {
        this.store.queue.push(data);
    }
};

ConsoleIO.App.Device.Console.prototype.addBatch = function addBatch() {
    if (this.active && !this.paused) {
        this.view.addBatch(this.getData(this.store.queue));
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
    this.view.addBatch(this.getData(this.store.added));
};

ConsoleIO.App.Device.Console.prototype.notify = function notify(clearAll) {
    ConsoleIO.Service.Socket.emit('webControl', {
        serialNumber: this.model.serialNumber,
        pageSize: ConsoleIO.Settings.pageSize.active,
        filters: this.filters,
        search: this.view.getValue('searchText'),
        paused: this.paused,
        clear: !!clearAll
    });
};


ConsoleIO.App.Device.Console.prototype.isSearchFiltered = function isSearchFiltered(data) {
    return this.searchRegex ? data.message.search(this.searchRegex) > -1 : true;
};

ConsoleIO.App.Device.Console.prototype.isFiltered = function isFiltered(data) {
    return this.filters.length === 0 || (this.filters.length > 0 && this.filters.indexOf(data.type) > -1);
};


ConsoleIO.App.Device.Console.prototype.setTabActive = function setTabActive() {
    this.view.setTabActive();
};


ConsoleIO.App.Device.Console.prototype.getData = function getData(store) {
    var count = 0, dataStore = [];
    if (store.length > 0) {
        ConsoleIO.every([].concat(store).reverse(), function (item) {
            if (this.isFiltered(item) && this.isSearchFiltered(item)) {
                dataStore.push(item);
                count++;
            }

            return ConsoleIO.Settings.pageSize.active > count;
        }, this);
    }

    return dataStore;
};


ConsoleIO.App.Device.Console.prototype.onPageSizeChanged = function onPageSizeChanged(btnId) {
    ConsoleIO.Settings.pageSize.active = btnId.split("-")[1];
    this.view.clear();
    this.view.addBatch(this.getData(this.store.added));
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
    this.view.addBatch(this.getData(this.store.added));
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
                    this.store.added = [];
                    this.notify(true);
                    break;
                case 'search':
                    this.applySearch();
                    this.notify();
                    break;
                case 'export':
                    ConsoleIO.Service.Socket.emit('exportLog', {
                        serialNumber: this.model.serialNumber,
                        name: this.model.name,
                        content: this.view.getHTML()
                    });
                    break;
                default:
                    this.parent.parent.parent.server.update({
                        status: 'Unhandled event',
                        btnId: btnId,
                        state: state
                    });
                    break;
            }
        }
    }
};
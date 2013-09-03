/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 27/08/13
 * Time: 14:57
 * Email: nisheeth.k.kashyap@gmail.com
 * Repositories: https://github.com/nkashyap
 *
 * Web
 */

(function (exports, global) {

    var web = exports.web = {};

    function Controller() {
        this.store = {
            added: [],
            queue: []
        };

        this.config = exports.util.extend({
            docked: false,
            position: 'bottom',
            height: '300px',
            width: '99%'
        }, exports.getConfig());

        this.control = {
            pageSize: 50,
            filters: [],
            paused: false,
            search: null
        };

        this.isEnabled = false;
        this.view = new View(this);

        //exports.transport.on('device:web:control', this.setControl, this);
    }

    Controller.prototype.setUp = function setUp() {
        var scope = this;
        exports.util.requireCSS(exports.util.getUrl('webStyle'), function () {
            scope.enabled();
        });
    };

    Controller.prototype.enabled = function enabled() {
        if (!this.isEnabled) {
            this.isEnabled = true;
            this.view.render(document.body);
            exports.console.on('console', exports.web.logger);
            exports.transport.emit('webStatus', { enabled: true });
        }
    };

    Controller.prototype.disabled = function disabled() {
        if (this.isEnabled) {
            this.isEnabled = false;
            exports.console.removeListener('console', exports.web.logger);
            exports.transport.emit('webStatus', { enabled: false });
            this.view.destroy();
        }
    };

    Controller.prototype.setControl = function setControl(data) {
        if (typeof data.paused !== 'undefined') {
            this.control.paused = data.paused;
        }

        if (typeof data.filters !== 'undefined') {
            this.control.filters = data.filters;
        }

        if (data.pageSize !== this.control.pageSize) {
            this.control.pageSize = data.pageSize;
        }

        if (data.search !== this.control.search) {
            this.applySearch(data.search);
        }

        this.view.clear();

        if (!data.clear) {
            this.view.addBatch(this.getData(this.store.added));
            this.addBatch();
        }
    };

    Controller.prototype.getData = function getData(store) {
        var count = 0, dataStore = [];
        if (store.length > 0) {
            exports.util.every([].concat(store).reverse(), function (item) {
                if (this.isFiltered(item) && this.isSearchFiltered(item)) {
                    dataStore.push(item);
                    count++;
                }

                return this.control.pageSize > count;
            }, this);
        }

        return dataStore;
    };

    Controller.prototype.hide = function hide() {
        return this.view.hide();
    };

    Controller.prototype.show = function show() {
        return this.view.show();
    };

    Controller.prototype.add = function add(data) {
        if (!this.control.paused) {
            this.store.added.push(data);
            this.view.add(data);
        } else {
            this.store.queue.push(data);
        }
    };

    Controller.prototype.addBatch = function addBatch() {
        if (!this.control.paused) {
            this.view.addBatch(this.getData(this.store.queue));
            this.store.added = this.store.added.concat(this.store.queue);
            this.store.queue = [];
        }
    };

    Controller.prototype.applySearch = function applySearch(value) {
        this.control.search = typeof value !== 'undefined' ? value : null;
        if (this.control.search) {
            if (this.control.search[0] !== "\\") {
                this.control.search = new RegExp("\\b" + this.control.search, "img");
            } else {
                this.control.search = new RegExp(this.control.search, "img");
            }
        }
    };

    Controller.prototype.isSearchFiltered = function isSearchFiltered(data) {
        return this.control.search ? data.message.search(this.control.search) > -1 : true;
    };

    Controller.prototype.isFiltered = function isFiltered(data) {
        return this.control.filters.length === 0 || (this.control.filters.length > 0 && this.control.filters.indexOf(data.type) > -1);
    };


    function View(ctrl) {
        this.ctrl = ctrl;
        this.elements = {};
        this.target = null;
        this.container = null;
    }

    View.prototype.render = function render(target) {
        this.target = target;
        this.createContainer();
    };

    View.prototype.reload = function reload() {
        this.clear();
        this.container.parentNode.removeChild(this.container);
        this.createContainer();
    };

    View.prototype.destroy = function destroy() {
        if (this.container) {
            this.clear();
            if (this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
                this.container = null;
                this.target = null;
            }
        }
    };

    View.prototype.hide = function hide() {
        if (this.target && this.container) {
            this.target.removeChild(this.container);
        }
    };

    View.prototype.show = function show() {
        if (this.target && this.container) {
            if (this.ctrl.config.position && this.ctrl.config.position === 'top') {
                this.target.insertBefore(this.container, exports.util.getFirstElement(this.target));
            } else {
                this.target.appendChild(this.container);
            }
        }
    };

    View.prototype.createContainer = function createContainer() {
        if (this.container) {
            return false;
        }

        var styles = [
            'background-color: rgba(244, 244, 244, 0.9)',
            'color: black',
            'z-index: 5000',
            'overflow: auto',
            'margin: 5px',
            '-o-box-shadow: 0 0 5px 1px #888',
            '-moz-box-shadow: 0 0 5px 1px #888',
            '-webkit-box-shadow: 0 0 5px 1px #888',
            'box-shadow: 0 0 5px 1px #888'
        ];

        if (!this.ctrl.config.docked) {
            styles.push('position:absolute');
        }

        if (this.ctrl.config.height) {
            styles.push('height:' + this.ctrl.config.height);
        }

        if (this.ctrl.config.width) {
            styles.push('width:' + this.ctrl.config.width);
        }

        switch (this.ctrl.config.position.toLowerCase()) {
            case 'top':
                styles.push('top: 5px');
                break;
            default:
                styles.push('bottom: 5px');
                break;
        }

        var config = exports.getConfig();
        exports.util.deleteCSSRule(exports.styleSheet, "#" + config.consoleId);
        exports.util.addCSSRule(exports.styleSheet, "#" + config.consoleId, styles.join(';'));

        this.container = this.createElement({
            attr: {
                id: config.consoleId,
                tabindex: 1
            },
            target: this.target,
            position: this.ctrl.config.position
        });
    };

    View.prototype.createElement = function createElement(config) {
        config.tag = config.tag || 'div';
        if (!this.elements[config.tag]) {
            this.elements[config.tag] = document.createElement(config.tag);
        }

        var element = this.elements[config.tag].cloneNode(false);
        exports.util.forEachProperty(config.attr, function (value, property) {
            if (value) {
                element.setAttribute(property, value);
            }
        });

        exports.util.forEachProperty(config.prop, function (value, property) {
            if (value) {
                element[property] = value;
            }
        });

        if (config.target) {
            if (config.position && config.position === 'top') {
                config.target.insertBefore(element, exports.util.getFirstElement(config.target));
            } else {
                config.target.appendChild(element);
            }
        }

        return element;
    };

    View.prototype.stripBrackets = function stripBrackets(data) {
        var last = data.length - 1;
        if (data.charAt(0) === '[' && data.charAt(last) === ']') {
            return data.substring(1, last);
        }
        return data;
    };

    View.prototype.getElementData = function getElementData(data) {
        var tag = 'code',
            css = data.type,
            stackMessage,
            message = this.stripBrackets(data.message);

        // check if asset failed
        if (data.type === "assert") {
            var asset = this.stripBrackets(message).split(",");
            if (asset[0].toLowerCase() !== "true") {
                css = "assert-failed";
            }
        }

        // for Opera and Maple browser
        message = message.replace(/%20/img, " ");

        // switch to pre mode if message contain object
        if (message.indexOf("{") > -1 && message.indexOf("}") > -1) {
            tag = 'pre';
        }

        if (data.stack) {
            var stack = data.stack.split(",")
                .join("\n")
                .replace(/"/img, '')
                .replace(/%20/img, ' ');

            stackMessage = this.stripBrackets(stack);
            message += '\n' + stackMessage;
        }

        if (['assert', 'dir', 'dirxml', 'error', 'trace'].indexOf(data.type) > -1) {
            tag = 'pre';
        }

        return {
            tag: tag,
            className: 'console type-' + css,
            message: (message || '.')
        };
    };

    View.prototype.add = function add(data) {
        if (!this.ctrl.isFiltered(data) || !this.ctrl.isSearchFiltered(data) || !this.container) {
            return false;
        }

        var element = this.getElementData(data);

        this.createElement({
            tag: element.tag,
            attr: {
                'class': element.className
            },
            prop: {
                innerHTML: element.message
            },
            target: this.container,
            position: 'top'
        });

        this.removeOverflowElement();
    };

    View.prototype.addBatch = function addBatch(store) {
        if (store.length > 0 && this.container) {
            var fragment = document.createDocumentFragment();

            exports.util.forEach(store, function (item) {
                var element = this.getElementData(item);
                this.createElement({
                    tag: element.tag,
                    attr: {
                        'class': element.className
                    },
                    prop: {
                        innerHTML: element.message
                    },
                    target: fragment,
                    position: 'bottom'
                });
            }, this);

            this.container.insertBefore(fragment, exports.util.getFirstElement(this.container));
            this.removeOverflowElement();
        }
    };

    View.prototype.clear = function clear() {
        if (this.container) {
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
        }
    };

    View.prototype.removeOverflowElement = function removeOverflowElement() {
        var length = this.container.childElementCount || this.container.children.length;
        while (length > this.ctrl.control.pageSize) {
            this.container.removeChild(this.container.lastElementChild || this.container.lastChild);
            length--;
        }
    };


    web.logger = function logger(data) {
        if (exports.web.console) {
            exports.web.console.add(data);
        }
    };

    web.setUp = function setUp() {
        if (!web.console) {
            web.console = new Controller();
        }

        web.console.setUp();
    };

    web.enabled = function enabled() {
        if (!web.console) {
            web.setUp();
        } else {
            web.console.enabled();
        }
    };

    web.disabled = function disabled() {
        if (web.console) {
            web.console.disabled();
        }
    };

    web.setConfig = function setConfig(data) {
        if (web.console) {
            web.console.setControl(data);
        }

        var info = [exports.name, exports.guid, exports.transport.isConnected() ? 'online' : 'offline'];

        if (data.paused) {
            info.push('paused');
        }

        if (data.filters && data.filters.length > 0) {
            info.push('filters:' + data.filters.join(","));
        }

        if (data.pageSize) {
            info.push('pagesize:' + data.pageSize);
        }

        if (data.search) {
            info.push('search:' + data.search);
        }

        exports.util.showInfo(info.join('|'), exports.transport.isConnected());
    };

    web.show = function show() {
        if (web.console) {
            return web.console.show();
        }
    };

    web.hide = function hide() {
        if (web.console) {
            return web.console.hide();
        }
    };

}('undefined' !== typeof ConsoleIO ? ConsoleIO : module.exports, this));
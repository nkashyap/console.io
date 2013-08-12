/**
 * Created with JetBrains WebStorm.
 * User: nisheeth
 * Date: 22/01/13
 * Time: 13:20
 * To change this template use File | Settings | File Templates.
 */

window.WebIO = (function () {

    "use strict";
    var log;

    function Controller(config) {
        this.store = {
            added: [],
            queue: []
        };

        this.config = window.ConsoleIO.extend({
            docked: false,
            position: 'bottom',
            height: '300px',
            width: '99%'
        }, config);

        this.control = {
            pageSize: 50,
            filters: [],
            paused: false,
            search: null
        };

        this.view = new View(this);

        if (window.SocketIO) {
            window.SocketIO.on('device:pluginConfig', this.syncConfig, this);
            window.SocketIO.on('device:pluginControl', this.syncControl, this);
            window.SocketIO.emit('plugin', { name: 'WebIO', enabled: true });
        }
    }

    Controller.prototype.render = function render(target) {
        this.view.render(target);
    };

    Controller.prototype.destroy = function destroy() {
        if (window.SocketIO) {
            window.SocketIO.emit('plugin', { name: 'WebIO', enabled: false });
        }
        this.view.destroy();
    };

    Controller.prototype.syncControl = function syncControl(data) {
        if (data.clear) {
            this.view.clear();
        } else {
            if (data.paused) {
                this.control.paused = data.paused;
            }

            if (data.filters) {
                this.control.filters = data.filters;
            }

            if (data.pageSize !== this.control.pageSize) {
                this.control.pageSize = data.pageSize;
            }

            if (data.search !== this.control.search) {
                this.applySearch(data.search);
            }

            this.view.clear();
            this.view.addBatch(this.store.added);
            this.addBatch();
        }
    };

    Controller.prototype.syncConfig = function syncConfig(data) {
        this.config = window.ConsoleIO.extend(this.config, data);
        this.view.reload();
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
            this.view.addBatch(this.store.queue);
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
        this.clear();
        this.container.parentNode.removeChild(this.container);
    };

    View.prototype.createContainer = function createContainer() {
        var styles = [
            'background-color: rgba(219, 255, 232, 0.3)',
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

        this.container = this.createElement({
            attr: {
                id: 'console-log',
                'style': styles.join(';'),
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
        window.ConsoleIO.forEachProperty(config.attr, function (value, property) {
            if (value) {
                element.setAttribute(property, value);
            }
        });

        window.ConsoleIO.forEachProperty(config.prop, function (value, property) {
            if (value) {
                element[property] = value;
            }
        });

        if (config.target) {
            if (config.position && config.position === 'top') {
                config.target.insertBefore(element, config.target.firstElementChild || config.target.firstChild);
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
        if (!this.ctrl.isFiltered(data) || !this.ctrl.isSearchFiltered(data)) {
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
        var length = store.length;
        if (length > 0) {
            var fragment = document.createDocumentFragment();

            if (this.ctrl.control.pageSize < length) {
                store = store.slice(0, this.ctrl.control.pageSize);
            }

            window.ConsoleIO.forEach(store, function (item) {
                if (!this.ctrl.isFiltered(item) || !this.ctrl.isSearchFiltered(item)) {
                    return false;
                }

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
                    position: 'top'
                });

            }, this);

            this.container.insertBefore(fragment, this.container.firstElementChild || this.container.firstChild);
            this.removeOverflowElement();
        }
    };

    View.prototype.clear = function clear() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    };

    View.prototype.removeOverflowElement = function removeOverflowElement() {
        var length = this.container.childElementCount || this.container.children.length;
        while (length > this.ctrl.control.pageSize) {
            this.container.removeChild(this.container.lastElementChild || this.container.lastChild);
            length--;
        }
    };


    function logConsole(data) {
        log.add(data);
    }

    function init(config) {
        log = new Controller(config);
        log.render(document.body);

        var webConfig = {};

        if (config.filters) {
            webConfig.filters = typeof config.filters === 'string' ? config.filters.split(',') : config.filters;
        }

        if (config.pageSize) {
            webConfig.pageSize = config.pageSize;
        }

        if (config.search) {
            webConfig.search = config.search;
        }

        log.syncControl(webConfig);

        window.ConsoleIO.on('console', logConsole);
    }

    function destroy() {
        window.ConsoleIO.off('console', logConsole);
        log.destroy();
    }

    return {
        init: init,
        destroy: destroy
    };
}());
/**
 * Created with IntelliJ IDEA.
 * User: nisheeth
 * Date: 20/05/13
 * Time: 20:17
 * To change this template use File | Settings | File Templates.
 */

ConsoleIO.namespace("ConsoleIO.Service.DHTMLXHelper");

ConsoleIO.Service.DHTMLXHelper = {
    populateToolbar: function populateToolbar(items, toolbar) {
        ConsoleIO.forEach(items, function (item, index) {
            switch (item.type) {
                case 'button':
                    this.addButton(item.id, index, item.text, item.imgEnabled, item.imgDisabled);
                    break;
                case 'separator':
                    this.addSeparator('separator+' + index, index);
                    break;
                case 'twoState':
                    this.addButtonTwoState(item.id, index, item.text, item.imgEnabled, item.imgDisabled);
                    this.setItemState(item.id, !!item.pressed);
                    break;
                case 'select':
                    if (item.opts === 'pagesizes') {
                        item.opts = [];
                        ConsoleIO.forEach(ConsoleIO.Settings.pageSize.list, function (number) {
                            item.opts.push([item.id + '-' + number, 'obj', number ]);
                        });
                        item.selected = item.id + '-' + ConsoleIO.Settings.pageSize.active;
                    }

                    this.addButtonSelect(item.id, index, item.text, item.opts, item.imgEnabled, item.imgDisabled);

                    if (item.selected) {
                        this.setListOptionSelected(item.id, item.selected);
                    }
                    break;
                case 'text':
                    this.addText(item.id, index, item.text);
                    break;
                case 'input':
                    this.addInput(item.id, index, item.value);
                    break;
            }

            if (item.disabled) {
                this.disableItem(item.id);
            }

            if (item.width) {
                this.setWidth(item.id, item.width);
            }

            if (item.tooltip) {
                this.setItemToolTip(item.id, item.tooltip);
            }
        }, toolbar);
    },

    elements: {},

    createElement: function createElement(config) {
        config.tag = config.tag || 'div';
        if (!this.elements[config.tag]) {
            this.elements[config.tag] = document.createElement(config.tag);
        }

        var element = this.elements[config.tag].cloneNode(false);

        ConsoleIO.forEachProperty(config.attr, function (value, property) {
            if (value) {
                element.setAttribute(property, value);
            }
        });

        ConsoleIO.forEachProperty(config.prop, function (value, property) {
            if (value) {
                element[property] = value;
            }
        });

        if (config.target) {
            if (config.insert && config.insert === 'top') {
                config.target.insertBefore(element, config.target.firstElementChild || config.target.firstChild);
            } else {
                config.target.appendChild(element);
            }
        }

        return element;
    },

    stripBrackets: function stripBrackets(data) {
        var last = data.length - 1;
        if (data.charAt(0) === '[' && data.charAt(last) === ']') {
            return data.substring(1, last);
        }
        return data;
    }
};
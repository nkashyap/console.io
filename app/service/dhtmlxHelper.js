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
                    this.setItemState(item.id, !!item.enabled);
                    break;
                case 'select':
                    this.addButtonSelect(item.id, index, item.text, item.opts, item.imgEnabled, item.imgDisabled);
                    break;
                case 'text':
                    this.addText(item.id, index, item.text);
                    break;
            }
        }, toolbar);
    },

    createElement: function createElement(config) {
        var element = document.createElement(config.tag || 'div');

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
    }
};
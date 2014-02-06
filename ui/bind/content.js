define([
    './../../base/DOM',
    './../../base/Util'
], function(DOM, _) {
    return {
        text: {
            update: function(element, value, oldValue, context) {
                if(value !== oldValue) {
                    DOM.setTextContent(element, value || '');
                }
            }
        },

        html: {
            update: function(element, value, oldValue, context) {
                if(_.isString(value)) {
                    element.innerHTML = value;
                } else {
                    DOM.removeChildren(element);
                    if(value) {
                        DOM.appendChild(value);
                    }
                }
            }
        },

        content: {
            update: function(element, value, oldValue, context) {
                if(!value && !oldValue) return;
                if(_.isString(value)) {
                    // use text
                    if('innerHTML' in element) {
                        element.innerHTML = value;
                    } else {
                        DOM.setTextContent(element, value);
                    }
                } else if(!value) {
                    DOM.removeChildren(element);
                } else if(_.isElement(value)) {
                    DOM.removeChildren(element);
                    element.appendChild(value);
                } else if(_.isElement(value.element)) { // assume we're working with a jide.js Component
                    DOM.removeChildren(element);
                    element.appendChild(value.element);
                }
            }
        }
    };
});
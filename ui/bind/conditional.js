define(['./../../base/DOM'], function(DOM) {
    function getBindData(element) {
        var data = DOM.getData(element);
        return data._bind || (data._bind = {});
    }

    return {
        'if': {
            init: function(element, context) {
                var data = getBindData(element);
                data.conditionalReplacement = document.createTextNode('');
                data.parentElement = element.parentNode;
            },

            update: function(element, value, oldValue, context) {
                var data = getBindData(element),
                    parent = data.parentElement,
                    replacement = data.conditionalReplacement;
                if(value && !element.parentNode) {
                    // okay, not part of the DOM so add it back in
                    parent.replaceChild(element, replacement);
                } else if(!value && element.parentNode) {
                    // need to hide the element
                    parent.replaceChild(replacement, element);
                }
            }
        },

        'unless': {
            init: function(element, context) {
                var data = getBindData(element);
                data.conditionalReplacement = document.createTextNode('');
                data.parentElement = element.parentNode;
            },

            update: function(element, value, oldValue, context) {
                var data = getBindData(element),
                  parent = data.parentElement,
                  replacement = data.conditionalReplacement;
                if(!value && !element.parentNode) {
                    // okay, not part of the DOM so add it back in
                    parent.replaceChild(element, replacement);
                } else if(value && element.parentNode) {
                    // need to hide the element
                    parent.replaceChild(replacement, element);
                }
            }
        }
    };
});
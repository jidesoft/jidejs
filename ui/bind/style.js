define([
    './../../base/DOM',
    './../../base/Observable',
    './../util/ClassList'
], function(DOM, Observable, ClassList) {
    return {
        css: {
            update: function(element, value, oldValue, context) {
                var component = DOM.hasData(element) && DOM.getData(element).component || null,
                    target = component || (element.classList && element) || new ClassList(element),
                    classes = Object.getOwnPropertyNames(value);
                classes.forEach(function(className) {
                    if(value[className]) {
                        target.classList.add(className);
                    } else {
                        target.classList.remove(className);
                    }
                });
                if(oldValue) {
                    Object.getOwnPropertyNames(oldValue).forEach(function(className) {
                        if(!value.hasOwnProperty(className)) {
                            target.classList.remove(className);
                        }
                    });
                }
            }
        },

        style: {
            update: function(element, value, oldValue) {
                for(var i = 0, names = Object.getOwnPropertyNames(value), len = names.length; i < len; i++) {
                    var styleName = names[i],
                        css = value[styleName];
                    if(!oldValue || oldValue[styleName] !== css) {
                        element.style[styleName] = css || '';
                    }
                }
            }
        },

        attr: {
            update: function(element, value, oldValue, context) {
                oldValue || (oldValue = {});

                var names = Object.getOwnPropertyNames(value);
                for(var i = 0, len = names.length; i < len; i++) {
                    var name = names[i],
                        attributeValue = Observable.unwrap(value[name]);
                    if(oldValue.hasOwnProperty(name) && Observable.unwrap(oldValue[name]) === attributeValue) continue;
                    if(attributeValue === false || attributeValue === null || attributeValue === undefined) {
                        element.removeAttribute(name);
                    } else {
                        element.setAttribute(name, String(attributeValue));
                    }
                }

                names = Object.getOwnPropertyNames(oldValue);
                for(i = 0, len = names.length; i < len; i++) {
                    if(!value.hasOwnProperty(names[i])) {
                        element.removeAttribute(names[i]);
                    }
                }
            }
        }
    };
});
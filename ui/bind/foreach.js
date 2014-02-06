define([
    './../../base/DOM',
    './../../base/Dispatcher',
    './../../base/Enumerator'
], function(DOM, Dispatcher, Enumerator) {
    var bind;

    function getBindData(element) {
        var data = DOM.getData(element);
        return data._bind || (data._bind = {});
    }

    function insertArrayToDOM(value, context, frag, template, disposables) {
        var useTemplate = template && template.content;
        for(var i = 0, len = value.length; i < len; i++) {
            var item = value.get(i),
                cloned = useTemplate
                    ? template.content.cloneNode(true)
                    : (item.element || item);
            if(useTemplate) disposables[i] = bind.to(cloned, context.$item, item);
            frag.appendChild(cloned);
        }
    }

    function update(element, context, event, template, disposables) {
        var changes = event.enumerator(),
            useTemplate = template && template.content,
            templateSize = useTemplate ? template.content.childNodes.length : 1,
            cloned, len;
        while(changes.moveNext()) {
            var change = changes.current,
                changeIndex = (change.index * templateSize);
            if(change.isDelete) {
                for(len = templateSize; 0 < len; len--) {
                    element.removeChild(element.childNodes[changeIndex]);
                }
                disposables.splice(change.index, 1).forEach(function(disposable) {
                    if(disposable) disposable.dispose();
                });
            } else if(change.isInsert) {
                cloned = useTemplate
                    ? template.content.cloneNode(true)
                    : (change.newValue.element || change.newValue);
                if(useTemplate) disposables.splice(change.index, 0, bind.to(cloned, context.$item, change.newValue));
                DOM.insertElementAt(element, cloned, changeIndex);
            } else if(change.isUpdate) {
                cloned = useTemplate
                    ? template.content.cloneNode(true)
                    : (change.newValue.element || change.newValue);
                if(useTemplate) {
                    disposables[change.index].dispose();
                    disposables[change.index] = bind.to(cloned, context.$item, change.newValue);
                }
                for(len = templateSize; 0 < len; len--) {
                    element.removeChild(element.childNodes[changeIndex]);
                }
                element.replaceChild(cloned, element.childNodes[change.index]);
            }
        }
    }

    var bindings = {
        foreach: {
            init: function(element, context) {
                // at this point, the element doesn't have any children left
                getBindData(element).template = element.firstElementChild;
                element.innerHTML = '';

                return true; // controls children
            },

            update: function(element, value, oldValue, context) {
                var bindData = getBindData(element),
                    template = bindData.template,
                    disposables = bindData.disposables || (bindData.disposables = []);
                var frag = document.createDocumentFragment();
                if(Array.isArray(value)) {
                    insertArrayToDOM({
                        length: value.length,
                        get: function(i) {
                            return value[i];
                        }
                    }, context, frag, template, disposables);
                } else if(value.on) {
                    insertArrayToDOM(value, context, frag, template, disposables);
                    var updateTicking = false, eventStore = [];
                    value.on('change', function(event) {
                        eventStore[eventStore.length] = event;
                        if(!updateTicking) {
                            updateTicking = true;
                            Dispatcher.requestAnimationFrame(function() {
                                updateTicking = false;
                                for(var i = 0, len = eventStore.length; i < len; i++) {
                                    update(element, context, eventStore[i], template, disposables);
                                }
                                eventStore.length = 0;
                            });
                        }
                    });
                }
                element.appendChild(frag);
            }
        }
    };

    return function(_bind) {
        bind = _bind;
        return bindings;
    }
});
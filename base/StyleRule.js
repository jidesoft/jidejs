define([
    './Class', './ObservableProperty', './Util',
    './DOM', './Observable', './Dispatcher'
], function(Class, ObservableProperty, _, DOM, Observable, Dispatcher) {
    var dashRegex = /([A-Z])/g,
      dashReplace = function(x) { return '-'+x.toLowerCase(); };
    var msRegex = /^ms-/;

    function updateSelector(event) {
        event.source.rule.selectorText = event.value;
    }

    function updateStyleRules(self, values) {
        for(var i = 0, len = values.length; i < len; i++) {
            var rule = values[i];
            self.rule.style[rule[0]] = rule[1];
        }
    }

    function joinRules(rules) {
        return Object.getOwnPropertyNames(rules).map(function(name) {
            var propertyName = name.replace(dashRegex, dashReplace).replace(msRegex, '-ms-');
            return propertyName + ':' + Observable.unwrap(rules[name]);
        }).join(';');
    }

    var exports = function(selector, rules) {
        installer(this);
        if(Observable.is(selector)) {
            this.selectorProperty.bind(selector);
        } else {
            this.selector = selector;
        }
        this.rule = DOM.addStylesheetRule(this.selector, joinRules(Observable.unwrap(rules)));
        this.selectorProperty.subscribe(updateSelector).bind(this);

        if(typeof rules !== 'undefined') {
            var updateTicking = false, self = this;
            var ruleUpdates = Observable.computed(function() {
                var result = [],
                    data = Observable.unwrap(rules);
                for(var names = Object.getOwnPropertyNames(data), i = 0, len = names.length; i < len; i++) {
                    var name = names[i],
                      value = data[name];
                    if(Observable.is(value)) {
                        result[result.length] = [name, value.get() || ''];
                    } else {
                        result[result.length] = [name, value || ''];
                    }
                }
                return result;
            });
            ruleUpdates.subscribe(function() {
                if(!updateTicking) {
                    updateTicking = true;
                    Dispatcher.requestAnimationFrame(function() {
                        updateStyleRules(self, ruleUpdates.get());
                        updateTicking = false;
                    });
                }
            });
            updateStyleRules(self, ruleUpdates.get());
        }
    };
    Class(exports).def({
        rule: null,
        selector: '',
        selectorProperty: null,

        get style() {
            return this.rule.style;
        }
    });
    var installer = ObservableProperty.install(exports, 'selector');
    return exports;
});
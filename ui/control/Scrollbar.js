define([
    '../../base/Class',
    '../../base/DOM',
    '../../base/Util',
    '../../base/ObservableProperty',
    '../Control',
    '../Skin',
    '../Template'
], function(
    Class, DOM, _, ObservableProperty,
    Control, Skin, Template
) {
    var scrollBarHeight = -1, scrollBarWidth = -1;

    var exports = function(config) {
        installer(this);
        Control.call(this, config);
    };

    Class(exports).extends(Control).def({
        orientation: 'horizontal',
        value: 0
    });
    var installer = ObservableProperty.install(exports, 'orientation', 'value', 'max');
    exports.Skin = Skin.create(Skin, {
        _asDimension: function(value) {
            return _.isNumber(value) || String(value).match(/^\d+$/) ? value+'px' : value;
        },

        template: Template(
            '<template class="jide-scrollbar" bind="'
                +'classList: [\'scrollbar-\'+(component.orientation === \'vertical\' ? \'v\' : \'h\')],'
                +'on: { scroll: handleScrollEvent }'
            +'">'
                +'<div pseudo="x-sizer" bind="'
                    +'style: {'
                        +'width: _asDimension(component.orientation === \'horizontal\' ? component.max : 0),'
                        +'height: _asDimension(component.orientation === \'vertical\' ? component.max : 0)'
                    +'}">&nbsp;</div>'
            +'</template>'),

        handleScrollEvent: function(skin, event) {
            //console.log(arguments);
            var scrollbar = skin.component;
            scrollbar.value = event.target['scroll'+(scrollbar.orientation === 'horizontal' ? 'Left' : 'Top')];
        },

        get scrollPosition() {
            return this.element['scroll'+(this.component.orientation === 'horizontal' ? 'Left' : 'Top')];
        },

        set scrollPosition(value) {
            this.element['scroll'+(this.component.orientation === 'horizontal' ? 'Left' : 'Top')] = value;
        },

        handleValueChangedEvent: function(event) {
            if(this.skin.scrollPosition !== event.value) {
                this.skin.scrollPosition = event.value;
            }
        },

        install: function() {
            Skin.prototype.install.call(this);

            if(this.component.orientation === 'horizontal' && scrollBarHeight === -1) {
                scrollBarHeight = DOM.measureCopy(this.element).height;
                DOM.addStylesheetRule('.jide-scrollbar.scrollbar-h', 'height: '+scrollBarHeight+'px');
            } else if(this.component.orientation === 'vertical' && scrollBarWidth === -1) {
                scrollBarWidth = DOM.measureCopy(this.element).width;
                DOM.addStylesheetRule('.jide-scrollbar.scrollbar-v', 'width: '+scrollBarWidth+'px');
            }

            this.managed(this.component.valueProperty.subscribe(this.handleValueChangedEvent));
        }
    });

    return exports;
});
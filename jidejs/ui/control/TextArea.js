/**
 * The TextArea is a multi-line text input control.
 * @module jidejs/ui/control/TextArea
 * @extends module:jidejs/ui/control/TextInputControl
 */
define([
	'./../../base/Class', './../Skin', './TextInputControl', './../../base/ObservableProperty',
    './../register'
], function(Class, Skin, TextInputControl, Observable, register) {
	function TextAreaSkin(input, el) {
        TextInputControl.Skin.call(this, input, el);
	}
	Class(TextAreaSkin).extends(TextInputControl.Skin).def({
        defaultElement: 'textarea',
        createDefaultRootElement: function() {
            return document.createElement('textarea');
        },

        updateRootElement: function() {
            if(this.element.nodeName !== 'textarea') {
                var newRoot = this.createDefaultRootElement();
                if(this.element.parentNode) this.element.parentNode.replaceChild(newRoot, this.element);
                this.element = newRoot;
            }
            Skin.prototype.updateRootElement.call(this);
        },

        install: function() {
            TextInputControl.Skin.prototype.install.call(this);
            this.managed(
                this.component.prefRowCountProperty.subscribe(this.updatePrefRowCount, this),
                this.component.prefColumnCountProperty.subscribe(this.updatePrefColumnCount, this)
            );
            if(this.component.prefRowCount) this.updatePrefRowCount({ value: this.component.prefRowCount });
            if(this.component.prefColumnCount) this.updatePrefColumnCount({ value: this.component.prefColumnCount });
            if(supportsPlaceholder) {
                this.managed(this.component.promptTextProperty.subscribe(function(event) {
                    this.element.placeholder = event.value || '';
                }, this));
                this.element.placeholder = this.component.promptText || '';
            } else {
                this.managed(
                    this.component.on('focus', function() {
                        var element = this.element;
                        if(element.value == this.promptText && this.classList.contains('jide-placeholding')) {
                            element.value = '';
                            this.classList.remove('jide-placeholding');
                        }
                    }),
                    this.component.on('blur', function() {
                        if(this.element.value == '') {
                            this.element.value = this.promptText;
                            this.classList.add('jide-placeholding');
                        }
                    })
                );
                if(this.component.text == '') {
                    this.element.value = this.component.promptText;
                    this.component.classList.add('jide-placeholding');
                }
            }
        },

        updatePrefRowCount: function(event) {
            this.element.rows = event.value;
        },

        updatePrefColumnCount: function(event) {
            this.element.cols = event.value;
        }
    });

	var supportsPlaceholder = ('placeholder' in document.createElement('textarea'));

	/**
	 * Creates a new TextArea.
	 * @memberof module:jidejs/ui/control/TextArea
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/TextArea
	 */
	function TextArea(config) {
		installer(this);
		config = config || {};
		TextInputControl.call(this, config);
		this.classList.add('jide-textarea');

	}
	Class(TextArea).extends(TextInputControl).def({
		dispose: function() {
			TextInputControl.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * The preferred number of rows.
		 * @type number
		 */
		prefRowCount: 2,
		/**
		 * Contains the preferred number of rows.
		 * @type module:jidejs/base/ObservableProperty
		 */
		prefRowCountProperty: null,
		/**
		 * The preferred number of columns.
		 * @type number
		 */
		prefColumnCount: 40,
		/**
		 * Contains the preferred number of columns.
		 * @type module:jidejs/base/ObservableProperty
		 */
		prefColumnCountProperty: null
	});
	var installer = Observable.install(TextArea, 'prefRowCount', 'prefColumnCount');
    TextArea.Skin = TextAreaSkin;
    register('jide-textarea', TextArea, TextInputControl, ['prefRowCount', 'prefColumnCount'], []);
	return TextArea;
});
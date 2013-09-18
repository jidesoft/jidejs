/**
 * The TextArea is a multi-line text input control.
 * @module jidejs/ui/control/TextArea
 * @extends module:jidejs/ui/control/TextInputControl
 */
define([
	'jidejs/base/Class', 'jidejs/ui/Skin', 'jidejs/ui/control/TextInputControl', 'jidejs/base/ObservableProperty'
], function(Class, Skin, TextInputControl, Observable) {
	function TextAreaSkin(input, el) {
		this.component = input;
		this.element = el || document.createElement('textarea');
	}
	Class(TextAreaSkin).extends(Skin);

	var supportsPlaceholder = ('placeholder' in document.createElement('textarea'));

	function setPrefRowCount(event) {
		this.element.rows = event.value;
		return event.value;
	}

	function setPrefColumnCount(event) {
		this.element.cols = event.value;
		return event.value;
	}

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
		if(!config.skin) config.skin = new TextAreaSkin(this, config.element);
		TextInputControl.call(this, config);
		this.prefRowCountProperty.subscribe(setPrefRowCount).bind(this);
		this.prefColumnCountProperty.subscribe(setPrefColumnCount).bind(this);
		if(this.prefRowCount) setPrefRowCount.call(this, { value: this.prefRowCount });
		if(this.prefColumnCount) setPrefColumnCount.call(this, { value: this.prefColumnCount });
		this.classList.add('jide-textarea');
		if(supportsPlaceholder) {
			this.promptTextProperty.subscribe(function(event) {
				this.element.placeholder = event.value || '';
			}, this);
			this.element.placeholder = this.promptText || '';
		} else {
			this.on('focus', function() {
				var element = this.element;
				if(element.value == this.promptText && this.classList.contains('jide-placeholding')) {
					element.value = '';
					this.classList.remove('jide-placeholding');
				}
			});
			this.on('blur', function() {
				if(this.element.value == '') {
					this.element.value = this.promptText;
					this.classList.add('jide-placeholding');
				}
			});
			if(this.text == '') {
				this.element.value = this.promptText;
				this.classList.add('jide-placeholding');
			}
		}
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
	return TextArea;
});
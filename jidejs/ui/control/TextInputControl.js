/**
 * The TextInputControl is the base for all types of controls that allow the user to input text.
 *
 * It is usually combined with a {@link module:jidejs/ui/control/Label} or a the {@link #promptText} to explain to
 * the user what kind of data she is supposed to enter into the input field.
 *
 * @module jidejs/ui/control/TextInputControl
 * @extends module:jidejs/ui/Control
 * @abstract
 */
define([
	'jidejs/base/Class', 'jidejs/base/ObservableProperty', 'jidejs/base/Util', 'jidejs/ui/Control', 'jidejs/ui/Skin'
], function(Class, Observable, _, Control, Skin) {
	function TextInputControlSkin(input, el) {
		this.component = input;
		this.element = el || (function() {
			var i = document.createElement('input');
			i.type = 'text';
			return i;
		}());
	}
	Class(TextInputControlSkin).extends(Skin);

	/**
	 * Called by subclasses to initialize the TextInputControl.
	 * @memberof module:jidejs/ui/control/TextInputControl
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/TextInputControl
	 */
	function TextInputControl(config) {
		installer(this);
		config = config || {};
		if(!config.skin) {
			config.skin  = new TextInputControlSkin(this, config.element);
		}
		Control.call(this, _.defaults(config, {tabIndex: 0}));
		this.textProperty.subscribe(function(event) {
			this.element.value = event.value;
		}, this);
		if(this.text) this.element.value = this.text;
		this.editableProperty.subscribe(function(event) {
			this.element.readOnly = !event.value;
		}, this);
		if(!this.editable) this.element.readOnly = true;
		this.classList.add('jide-textinput');
		this.on('keyup', _.debounce(function() {
			this.text = this.element.value;
		}, 50));
	}

	Class(TextInputControl).extends(Control).def({
		dispose: function() {
			Control.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * The text that is displayed by the control.
		 * @type string
		 */
		text: '',
		/**
		 * The text that is displayed by the control.
		 *
		 * Listen to changes to this property to be notified of any changes that the user makes to the text in the
		 * control.
		 *
		 * @type module:jidejs/base/ObservableProperty
		 */
		textProperty: null,
		/**
		 * Defines whether or not the user can modify the value of the TextInputControl.
		 * @type boolean
		 */
		editable: true,
		/**
		 * Defines whether or not the user can modify the value of the TextInputControl.
		 * @type module:jidejs/base/ObservableProperty
		 */
		editableProperty: null,
		/**
		 * This text is displayed when there is no other text in the control and helps the user to understand what
		 * type of data she should enter into the input control.
		 * @type string
		 */
		promptText: '',
		/**
		 * This text is displayed when there is no other text in the control and helps the user to understand what
		 * type of data she should enter into the input control.
		 * @type module:jidejs/base/ObservableProperty
		 */
		promptTextProperty: null
	});
	var installer = Observable.install(TextInputControl, 'text', 'editable', 'promptText');
	return TextInputControl;
});
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
	'./../../base/Class', './../../base/ObservableProperty', './../../base/Util',
    './../Control', './../Skin', './../register'
], function(Class, Observable, _, Control, Skin, register) {
	function createInputElement() {
		var i = document.createElement('input');
		i.type = 'text';
		return i;
	}

	function TextInputControlSkin(input, el) {
		Skin.call(this, input, el);
	}
	Class(TextInputControlSkin).extends(Skin).def({
        createDefaultRootElement: function() {
            var i = document.createElement('input');
            i.type = 'text';
            return i;
        },

        updateRootElement: function() {
            if(this.element.nodeName !== 'INPUT') {
                var newRoot = this.createDefaultRootElement();
                if(this.element.parentNode) this.element.parentNode.replaceChild(newRoot, this.element);
                this.element = newRoot;
            }
            Skin.prototype.updateRootElement.call(this);
        },

        install: function() {
            Skin.prototype.install.call(this);

            this.managed(
                this.component.textProperty.subscribe(function(event) {
                    this.element.value = event.value;
                }, this),
                this.component.editableProperty.subscribe(function(event) {
                    this.element.readOnly = !event.value;
                }, this),
                this.component.on('keyup', _.debounce(function() {
                    this.text = this.element.value;
                }, 50))
            );
            if(this.component.text) this.element.value = this.component.text;
            if(!this.component.editable) this.element.readOnly = true;
        }
    });

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
		Control.call(this, _.defaults(config, {tabIndex: 0}));
		this.classList.add('jide-textinput');
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
    TextInputControl.Skin = TextInputControlSkin;
	var installer = Observable.install(TextInputControl, 'text', 'editable', 'promptText');
    register('jide-textinput', TextInputControl, Control, ['text', 'editable', 'promptText'], []);
	return TextInputControl;
});
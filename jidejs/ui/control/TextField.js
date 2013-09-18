/**
 * A TextField is a single line text input control.
 * It allows the user to insert arbitrary text content.
 *
 * @module jidejs/ui/control/TextField
 * @extends module:jidejs/ui/control/TextInputControl
 */
define(['jidejs/base/Class', 'jidejs/ui/control/TextInputControl'], function(Class, TextInputControl) {
	var supportsPlaceholder = ('placeholder' in document.createElement('input'));

	/**
	 * This event is fired whenever the user commits the value of the TextField, usually through pressing the `enter` key
	 * of her keyboard while the TextField has the focus.
	 *
	 * It can be observed by listening to the `action` event of the TextField.
	 *
	 * @memberof module:jidejs/ui/control/TextField
	 * @event TextField#action
	 */

	/**
	 * Creates a new TextField control.
	 *
	 * @memberof module:jidejs/ui/control/TextField
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/TextField
	 * @fires TextField#action Dispatched when the user commits the value of the TextField.
	 */
	function TextField(config) {
		TextInputControl.call(this, config);
		this.classList.add('jide-textfield');
		if(supportsPlaceholder) {
			this.promptTextProperty.subscribe(function(event) {
				this.element.placeholder = event.value;
			}, this);
			this.element.placeholder = this.promptText || ' ';
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

		this.keyMap.on({key: 'Enter'}, function() {
			this.dispatch('action');
		});
	}

	Class(TextField).extends(TextInputControl);

	return TextField;
});
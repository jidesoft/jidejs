/**
 * A TextField is a single line text input control.
 * It allows the user to insert arbitrary text content.
 *
 * @module jidejs/ui/control/TextField
 * @extends module:jidejs/ui/control/TextInputControl
 */
define([
    './../../base/Class', './../Skin', './TextInputControl', './../register'
], function(Class, Skin, TextInputControl, register) {
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
	}

	Class(TextField).extends(TextInputControl);
    TextField.Skin = Skin.create(TextInputControl.Skin, {
        install: function() {
            TextInputControl.Skin.prototype.install.call(this);
            if(supportsPlaceholder) {
                this.component.promptTextProperty.subscribe(function(event) {
                    this.element.placeholder = event.value;
                }, this);
                this.element.placeholder = this.component.promptText || ' ';
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

            this.managed(this.component.keyMap.on({key: 'Enter'}, function() {
                this.emit('action');
            }));
        }
    });

    register('jide-textfield', TextField, TextInputControl, [], []);

	return TextField;
});
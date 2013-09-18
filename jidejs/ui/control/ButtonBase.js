/**
 * An extension of {@link module:jidejs/ui/control/Labeled} that is specialized for handling click gestures
 * performed by users.
 *
 * This class is used as a base for more specialized controls:
 *
 * * {@link module:jidejs/ui/control/Button}
 *
 *     Used for commands and actions.
 * * {@link module:jidejs/ui/control/PopupButton}
 *
 *     Used to show a popup which offers more choices.
 * * {@link module:jidejs/ui/control/ToggleButton}
 *     Used to toggle the state of an object. Good usages include states such as "Auto save enabled".
 *
 * @module jidejs/ui/control/ButtonBase
 * @extends module:jidejs/ui/control/Labeled
 * @abstract
 */
define([
		'jidejs/base/Class', 'jidejs/base/ObservableProperty', 'jidejs/base/Util', 'jidejs/ui/Component', 'jidejs/ui/Skin',
		'jidejs/ui/control/Labeled'
], function(Class, Observable, _, Component, Skin, Labeled) {
		var commandBinding = '$jide/ui/control/ButtonBase.command$';

		function delegateToCommand() {
			this.command.execute();
		}

		/**
		 * This event is fired whenever the user invokes the button, usually through a click or tap within
		 * the bounds of the button. If the Button currently has the focus, it might also be fired through keyboard
		 * events such as the spacebar or the enter key.
		 *
		 * It can be observed by listening to the `action` event of a Control.
		 *
		 * @memberof module:jidejs/ui/control/ButtonBase
		 * @event ButtonBase#action
		 */

		/**
		 * Creates a new ButtonBase. Must only be invoked by subclasses.
		 *
		 * @memberof module:jidejs/ui/control/ButtonBase
		 * @param {object} config The configuration.
		 * @param {boolean} config.enabled `true`, if the button is enabled; `false`, otherwise.
		 * @constructor
		 * @alias module:jidejs/ui/control/ButtonBase
		 * @fires ButtonBase#action Fired when the user clicks or taps within the buttons bounds.
		 */
		function ButtonBase(config) {
			installer(this);
			config = _.defaults(config || {}, { tabIndex: 0 });
			if(!config.skin) config.skin = new ButtonBase.Skin(this, config.element);
			Labeled.call(this, config);
			this.classList.add('jide-buttonbase');
		}
		Class(ButtonBase).extends(Labeled).def({
			/**
			 * `true`, if the button is enabled; `false`, otherwise.
			 *
			 * A disabled button does not react to user interaction. Set the value of this property to `false` if a
			 * command is currently not available.
			 *
			 * @type boolean
			 */
			enabled: true,
			/**
			 * `true`, if the button is enabled; `false`, otherwise.
			 * @type module:jidejs/base/ObservableProperty
			 */
			enabledProperty: null,
			command: null, commandProperty: null,

			dispose: function() {
				Labeled.prototype.dispose.call(this);
				installer.dispose(this);
			}
		});
		ButtonBase.Skin = Skin.create(Labeled.Skin, {
			/**
			 * Registers all necessary property bindings and returns them as an array.
			 * @returns {{ dispose: function() {}}[]}
			 */
			installBindings: function() {
				var button = this.component,
					commandBinding = null;
				if(!button.enabled) {
					button.element.setAttribute('disabled', 'disabled');
					button.classList.add('jide-state-disabled');
				}
				var bindings = Labeled.Skin.prototype.installBindings.call(this).concat(
					button.enabledProperty.subscribe(function(event) {
						if(event.value) {
							this.element.removeAttribute('disabled');
							this.classList.remove('jide-state-disabled');
						} else {
							this.element.setAttribute('disabled', 'disabled');
							this.classList.add('jide-state-disabled');
						}
					}),
					button.commandProperty.subscribe(function(event) {
						if(event.oldValue) {
							commandBinding.dispose();
						}
						if(event.value) {
							button.enabledProperty.bind(event.value.enabledProperty);
						}
						if(event.oldValue && !event.value) {
							button.removeListener('action', delegateToCommand);
						} else if(!event.oldValue && event.value) {
							button.on('action', delegateToCommand).bind(this);
						}
					}, this)
				);
				if(button.command) {
					commandBinding = button.enabledProperty.bind(button.command.enabledProperty);
					bindings.push(button.on('action', delegateToCommand).bind(button));
				}
				return bindings;
			},

			/**
			 * Registers all necessary event handlers and returns their {@link module:jidejs/base/Subscription}s as an array.
			 * @returns {module:jidejs/base/Subscription[]}
			 */
			installListeners: function() {
				var button = this.component, mouseOver = false, mouseDown = false, armed = false;
				var updateArmedState = function() {
					if(armed) {
						button.classList.add('armed');
					} else {
						button.classList.remove('armed');
					}
				};
				var dispatcher = function() {
					if(button.enabled) {
						button.emit('action');
					}
				};
				return Labeled.Skin.prototype.installListeners.call(this).concat(button.on({
					mouseover: function() {
						mouseOver = true;
						armed = mouseOver && mouseDown;
						updateArmedState();
					},
					mouseout: function() {
						mouseOver = false;
						armed = false;
						updateArmedState();
					},
					mousedown: function() {
						mouseDown = true;
						armed = mouseOver && mouseDown;
						updateArmedState();
					},
					mouseup: function() {
						mouseDown = false;
						armed = false;
						updateArmedState();
					},
					click: function(e) {
						if(e.button !== 2 && button.enabled) {
							button.emit('action');
						}
					},
					key: {
						Enter: dispatcher,
						Spacebar: dispatcher
					}
				}));
			}
		});
		var installer = Observable.install(ButtonBase, 'command', 'enabled');
		return ButtonBase;
});
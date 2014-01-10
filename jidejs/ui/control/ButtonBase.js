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
		'jidejs/ui/control/Labeled', 'jidejs/ui/register', 'jidejs/ui/control/Templates'
], function(Class, Observable, _, Component, Skin, Labeled, register, Templates) {
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
            template: Templates.ButtonBase,
			install: function() {
                Labeled.Skin.prototype.install.call(this);
				var button = this.component,
					commandBinding = null;
				this.managed(button.commandProperty.subscribe(function(event) {
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
                        event.stopPropagation();
					})
				);
				if(button.command) {
					commandBinding = button.enabledProperty.bind(button.command.enabledProperty);
					this.managed(button.on('action', delegateToCommand).bind(button));
				}
			},

			installListeners: function() {
                Labeled.Skin.prototype.installListeners.call(this);
				var button = this.component, mouseOver = false, mouseDown = false, armed = false;
				var updateArmedState = function() {
					if(armed) {
						button.classList.add('armed');
					} else {
						button.classList.remove('armed');
					}
				};
				var dispatcher = function(event) {
					if(button.enabled) {
						button.emit('action', event);
						if(event) event.stopPropagation();
					}
				};
				this.managed(button.on({
					mouseover: function(event) {
						mouseOver = true;
						armed = mouseOver && mouseDown;
						updateArmedState();
						event.stopPropagation();
					},
					mouseout: function(event) {
						mouseOver = false;
						armed = false;
						updateArmedState();
						event.stopPropagation();
					},
					mousedown: function(event) {
						mouseDown = true;
						armed = mouseOver && mouseDown;
						updateArmedState();
						event.stopPropagation();
					},
					mouseup: function(event) {
						mouseDown = false;
						armed = false;
						updateArmedState();
						event.stopPropagation();
					},
					click: function(e) {
						if(e.button !== 2 && button.enabled) {
							button.emit('action', e);
							e.stopPropagation();
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
		register('jide-buttonbase', ButtonBase, Labeled, ['enabled', 'command'], []);
		return ButtonBase;
});
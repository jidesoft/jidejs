/**
 * A CheckBox is a special kind of button used to allow users to enable or disable certain options.
 * It is therefore similiar to {@link module:jidejs/ui/control/ToggleButton} but is displayed radically different from it
 * and looks more like a checkbox the user may know from paper forms.
 *
 * CheckBoxes in jide.js support three states that the user can toggle between:
 *
 * * indeterminate
 * * not selected
 * * selected
 *
 * As opposed to standard {@link module:jidejs/ui/control/Button Buttons} you should not listen to the `action` event
 * and instead observe its {@link #selected} and {@link #indeterminate} state.
 *
 * @module jidejs/ui/control/CheckBox
 * @extends module:jidejs/ui/control/ButtonBase
 */
define(
	['jidejs/base/Class', 'jidejs/base/ObservableProperty', 'jidejs/ui/Skin', 'jidejs/ui/control/ButtonBase', 'jidejs/ui/control/Toggle',
		'jidejs/ui/control/SVGView', 'jidejs/base/Util'],
	function(Class, Observable, Skin, ButtonBase, Toggle, SVGView, _) {
		var svgView = (function() {
			var svgView = document.createDocumentFragment();
			var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', 'M 10 45 L 40 80 L 90 0');
			path.setAttribute('class', 'jide-checkbox-check');
			svgView.appendChild(path);
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', 'M 10 50 L 90 50');
			path.setAttribute('class', 'jide-checkbox-indeterminate');
			svgView.appendChild(path);
			return svgView;
		}());

		var selectedPropertyChanged = function(event) {
			if(event.value) {
				this.classList.add('jide-state-selected');
			} else {
				this.classList.remove('jide-state-selected');
			}
		};

		var indeterminatePropertyChanged = function(event) {
			if(event.value) {
				this.classList.add('jide-state-indeterminate');
			} else {
				this.classList.remove('jide-state-indeterminate');
			}
		};

		var clickHandler = function() {
			if(this.allowIndeterminate) {
				// !s & i => !s & !i => s & !i
				var isSelected = this.selected;
				var isIndeterminate = this.indeterminate;
				if(!isSelected) {
					if(isIndeterminate) {
						this.indeterminate = false;
					} else {
						this.selected = true;
					}
				} else {
					this.selected = false;
					this.indeterminate = true;
				}
			} else {
				this.selected = !this.selected;
			}
		};

		/**
		 * Creates a new CheckBox.
		 *
		 * @memberof module:jidejs/ui/control/CheckBox
		 * @param {object} config The configuration.
		 * @constructor
		 * @alias module:jidejs/ui/control/CheckBox
		 */
		function CheckBox(config) {
			installer(this);
			Toggle.installer(this);
			config || (config = {});
			if(!config.skin) config.skin = new CheckBox.Skin(this, config.element);
			ButtonBase.call(this, config);
			Toggle.call(this);

			if(!this.graphic) {
				this.graphic = new SVGView({
//					width: '1em',
//					height: '1em',
					viewBox: { width: 100, height: 100 },
					content: svgView.cloneNode(true)
				});
			}
			this.classList.add('jide-checkbox');
		}

		Class(CheckBox).extends(ButtonBase).mixin(Toggle).def({
			/**
			 * `true`, if the CheckBox is selected; `false`, otherwise.
			 *
			 * The value of this property does not matter when the {@link #indeterminate} property is `true`.
			 * @type boolean
			 * @property selected
			 */
			/**
			 * `true`, if the CheckBox is selected; `false`, otherwise.
			 * @type module:jidejs/base/ObservableProperty
			 * @property selectedProperty
			 */
			/**
			 * The toggle group that manages this CheckBox.
			 *
			 * This property is optional and doesn't need to be specified.
			 *
			 * @type module:jidejs/ui/control/ToggleGroup
			 * @property toggleGroup
			 */
			/**
			 * The toggle group that manages this CheckBox.
			 *
			 * @type module:jidejs/base/ObservableProperty
			 * @property toggleGroupProperty
			 */
			/**
			 * `true`, if the CheckBox should be considered neither _selected_ nor _not selected_; `false`, otherwise.
			 *
			 * If this property is `true`, then the value of the {@link #selected} property should be ignored.
			 *
			 * @type boolean
			 */
			indeterminate: false,
			/**
			 * `true`, if the CheckBox should be considered neither _selected_ nor _not selected_; `false`, otherwise.
			 */
			indeterminateProperty: null,
			/**
			 * If `true`, then the CheckBox allows three states: _indeterminate_, _not selected_ and _selected_,
			 * otherwise the CheckBox will only allow two states: _not selected_ and _selected_.
			 *
			 * @type boolean
			 */
			allowIndeterminate: false,

			dispose: function() {
				ButtonBase.prototype.dispose.call(this);
				installer.dispose(this);
			}
		});
		var installer = Observable.install(CheckBox, 'indeterminate');
		CheckBox.Skin = Skin.create(ButtonBase.Skin, {
			installBindings: function() {
				var checkBox = this.component;
				if(checkBox.selected) selectedPropertyChanged.call(checkBox, {value: true});
				if(checkBox.indeterminate) indeterminatePropertyChanged.call(checkBox, {value: true});
				return ButtonBase.Skin.prototype.installBindings.call(this).concat(
					checkBox.selectedProperty.subscribe(selectedPropertyChanged),
					checkBox.indeterminateProperty.subscribe(indeterminatePropertyChanged)
				);
			},
			installListeners: function() {
				return ButtonBase.Skin.prototype.installListeners.call(this).concat(this.component.on('action', clickHandler));
			}
		});

		return CheckBox;
});
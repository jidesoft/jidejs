/**
 * A RadioButton is similar to a {@link module:jidejs/ui/control/CheckBox} in that it allows the user to make a choice,
 * however, it should be used when the user can choose between two or more options and must select exactly one of them.
 *
 * @module jidejs/ui/control/RadioButton
 * @extends module:jidejs/ui/control/ButtonBase
 * @extends module:jidejs/ui/control/Toggle
 */
define([
	'./../../base/Class', './../../base/ObservableProperty', './ButtonBase', './Toggle',
	'./SVGView'
], function(Class, Observable, ButtonBase, Toggle, SVGView) {
	var idCounter = 0;
	var svgView = (function() {
		var svgView = document.createDocumentFragment();
		var path = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		path.setAttribute('r', '320');
		path.setAttribute('cy', '241.49997');
		path.setAttribute('cx', '322.00002');
		path.setAttribute('class', 'jide-radiobutton-radio');
		svgView.appendChild(path);
		path = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		path.setAttribute('r', '103.47947');
		path.setAttribute('cy', '244');
		path.setAttribute('cx', '322');
		path.setAttribute('class', 'jide-radiobutton-mark');
		svgView.appendChild(path);
		return svgView;
	}());

	/**
	 * Creates a new RadioButton.
	 * @memberof module:jidejs/ui/control/RadioButton
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/RadioButton
	 */
	function RadioButton(config) {
		Toggle.installer(this);
		ButtonBase.call(this, config);
		Toggle.call(this);
		this.selectedProperty.subscribe(function(event) {
			if(event.value) {
				this.classList.add('jide-state-selected');
			} else {
				this.classList.remove('jide-state-selected');
			}
		}, this);
		if(this.selected) {
			this.classList.add('jide-state-selected');
		}
		if(!this.graphic) {
			this.graphic = new SVGView({
				width: '1em',
				height: '1em',
				viewBox: { width: 640, height: 480 },
				content: svgView.cloneNode(true)
			});
		}
		this.on('click', function() {
			this.selected = !this.selected;
		});
		this.classList.add('jide-radiobutton');
	}

	Class(RadioButton).extends(ButtonBase).mixin(Toggle).def({
		/**
		 * `true`, if the RadioButton is currently selected; `false`, otherwise.
		 * @type boolean
		 * @property selected
		 */
		/**
		 * `true`, if the RadioButton is currently selected; `false`, otherwise.
		 * @type module:jidejs/base/ObservableProperty
		 * @property selectedProperty
		 */
		/**
		 * The ToggleGroup that this RadioButton belongs to.
		 * @property toggleGroup
		 */
		/**
		 * The ToggleGroup that this RadioButton belongs to.
		 * @type module:jidejs/base/ObservableProperty
		 * @property toggleGroupProperty
		 */
	});
    RadioButton.Skin = ButtonBase.Skin;

	return RadioButton;
});
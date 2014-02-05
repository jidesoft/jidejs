/**
 * A ProgressBar is used to show the user a visual indication of the progress of a long running action.
 *
 * @module jidejs/ui/control/ProgressBar
 */
define([
	'./../../base/Class', './../../base/ObservableProperty', './../Control', './../Skin', './../../base/Dispatcher',
	'./../../base/Animation'
], function(Class, Observable, Control, Skin, Dispatcher, Animation) {
	var template = (function() {
		var progress = document.createElement('div');
		var bar = document.createElement('div');
		bar.className = 'jide-progress-bar';
		bar.innerHTML = '&nbsp;';
		progress.appendChild(bar);
		return progress;
	}());
	function ProgressBarSkin(progress, element) {
		Skin.call(this, progress, element || template.cloneNode(true));
		this.bar = this.element.firstChild;
	}
	Class(ProgressBarSkin).extends(Skin).def({
		installBindings: function() {
			var bar = this.bar;
			this.animation = new Animation({
				duration: 0,
				step: function(time) {
					var x = (time % 2000)/2000; // one loop takes 2 seconds
					bar.style.backgroundPosition = (40 - x * 40)+'px 0px';
				}
			});
			if(!Animation.isCSSAnimationSupported) this.animation.start();
			if(this.component.progress) bar.style.width = (this.component.progress * 100)+'%';
			if(this.component.indeterminate) this.component.classList.add('jide-progressbar-indeterminate');
			return Skin.prototype.installBindings.call(this).concat([
				this.component.progressProperty.subscribe(function(event) {
					this.width = (event.value*100)+'%';
				}).bind(this.bar.style),
				this.component.indeterminateProperty.subscribe(function(event) {
					if(event.value) {
						this.classList.add('jide-progressbar-indeterminate');
					} else {
						this.classList.remove('jide-progressbar-indeterminate');
					}
				})
			]);
		},

		dispose: function() {
			Skin.prototype.dispose.call(this);
//			var bindings = this.bindings;
//			for(var i = 0, len = bindings.length; i < len; i++) {
//				bindings[i].dispose();
//			}
//			this.bindings = [];
			if(!this.animation.stopped) this.animation.stop();
			delete this.animation;
		}
	});

	/**
	 * Creates a new ProgressBar.
	 * @memberof module:jidejs/ui/control/ProgressBar
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/ProgressBar
	 */
	function ProgressBar(config) {
		installer(this);
		config = config || {};
		Control.call(this, config);
		this.classList.add('jide-progressbar');
	}
	Class(ProgressBar).extends(Control).def({
		dispose: function() {
			Control.prototype.dispose.call(this);
		},

		/**
		 * When `true` the ProgressBar will not need a specific {@link module:jidejs/ui/control/ProgressBar#progress}.
		 * This option should be enabled if the total time can not be estimated or no information about the progress
		 * of the action can be made.
		 * @type boolean
		 */
		indeterminate: false,
		/**
		 * When `true` the ProgressBar will not need a specific {@link module:jidejs/ui/control/ProgressBar#progress}.
		 * @see module:jidejs/ui/control/ProgressBar#indeterminate
		 * @type module:jidejs/base/ObservableProperty
		 */
		indeterminateProperty: null,
		/**
		 * The progress that should be displayed to the user. Must be a number between `0` and `1`.
		 * @type number
		 */
		progress: 0,
		/**
		 * The progress that should be displayed to the user. Must be a number between `0` and `1`.
		 * @type module:jidejs/base/ObservableProperty
		 */
		progressProperty: null
	});
	var installer = Observable.install(ProgressBar, 'indeterminate', 'progress');
    ProgressBar.Skin = ProgressBarSkin;
	return ProgressBar;
});
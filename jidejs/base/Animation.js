/**
 * This module handles animations using either Javascript or CSS3 features.
 *
 * It wil try to use the best animation technique available, falling back to setTimeout only when nothing else is
 * available.
 *
 * Note that there are way more powerful Animation libraries available that work in combination with jide.js. This module
 * is itended to support the most common use cases of jide.js.
 *
 * @module jidejs/base/Animation
 */
define('jidejs/base/Animation', [
	'jidejs/base/Class', 'jidejs/base/Util', 'jidejs/base/Deferred', 'jidejs/base/DOM', 'jidejs/base/Dispatcher'
], function(Class, _, Deferred, DOM, Dispatcher) {
	// polyfill for performance.now
	var performance = window.performance;
	var vendors = ['ms', 'moz', 'webkit', 'o'], now = window.performance && performance.now && 'now';
	if(window.performance) {
		for(var i = 0, len = vendors.length; i < len && !now; ++i) {
			var prefix = vendors[i]+'Now';
			now = performance[prefix] && prefix || null;
		}
	}

	var animationString = 'animation',
		keyFramePrefix = '',
		isCSSAnimationSupported = false;
	(function() {
		var elm = document.createElement('div'),
			domPrefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'],
			pfx  = '';

		if( elm.style.animationName ) { isCSSAnimationSupported = true; }

		if( isCSSAnimationSupported === false ) {
			for( var i = 0; i < domPrefixes.length; i++ ) {
				if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
					pfx = domPrefixes[ i ];
					animationString = pfx + 'Animation';
					keyFramePrefix = '-' + pfx.toLowerCase() + '-';
					isCSSAnimationSupported = true;
					break;
				}
			}
		}
	}());

	var transitionEnd = (function (){
		var t;
		var el = document.createElement('span');
		var transitions = {
			'transition':'transitionEnd',
			'OTransition':'oTransitionEnd',
			'MSTransition':'msTransitionEnd',
			'MozTransition':'transitionend',
			'WebkitTransition':'webkitTransitionEnd'
		};

		for(t in transitions) {
			if(transitions.hasOwnProperty(t) && el.style[t] !== undefined){
				return transitions[t];
			}
		}
		return '';
	}());

	/**
	 * Creates a new Animation.
	 *
	 * @memberof module:jidejs/base/Animation
	 * @param {number|Object} duration The time that the animation should run or an object that should be integrated
	 * 								   in the animation object.
	 * @constructor
	 * @alias module:jidejs/base/Animation
	 */
	function Animation(duration) {
		if(_.isNumber(duration)) {
			this.duration = duration;
		} else {
			_.extends(this, duration);
		}
	}

	/**
	 * Tries to animate an element using CSS transitions, if CSS transitions aren't available, it will fallback to
	 * using Javascript.
	 *
	 * The configuration object supports the following values:
	 *
	 * @param {{element: Element, property: string, start: number, target: number, unit: string, duration: number, method: Function}} config The configuration of the animation.
	 * @param {Element} config.element The DOM element whose property should be transitioned.
	 * @param {string} config.property The name of the property that should be transitioned.
	 * @param {number?} config.start (optional, default: *0*) The start value of the property.
	 * @param {number} config.target The target value of the property.
	 * @param {string?} config.unit (optional, default: *""*) The unit of the property, i.e. px, em.
	 * @param {number?} config.duration (optional, default: *1000*) The duration of the animation in milliseconds.
	 * @param {Function?} config.method (optional, default: *Animation.linear*) The method of the animation which defines its pace.
	 * @memberof module:jidejs/base/Animation
	 * @returns {Promise} The promise will be fulfilled when the animation was completed succesfully.
	 */
	Animation.cssTransition = function(config) {
		var el = config.element,
			prop = config.property,
			start = config.start || 0,
			target = config.target,
			unit = config.unit || '',
			duration = config.duration || 1000,
			method = config.method || Animation.linear;
		if(isCSSAnimationSupported) {
			var deferred = new Deferred();
			var listener = function() {
				deferred.fulfill(true);
				el.removeEventListener(transitionEnd, listener, false);
			};
			el.addEventListener(transitionEnd, listener, false);
			el.style[prop] = target+unit;
			return deferred.promise;
		} else {
			var anim = new Animation({
				duration: duration,
				method: method,
				step: function(time) {
					if((start < target)) {
						el.style[prop] = (start + (time * target))+unit;
					} else {
						el.style[prop] = ((start - target) * (1-time))+unit;
					}
				}
			});
			return anim.start();
		}
	};

	/**
	 * A flag that signals whether CSS animations are available.
	 *
	 * *true*, if CSS animations are available; *false* otherwise.
	 *
	 * @memberof module:jidejs/base/Animation
	 * @type {boolean}
	 */
	Animation.isCSSAnimationSupported = isCSSAnimationSupported;
	/**
	 * The name of the Animation property used by CSS, including the browser prefix, if available.
	 * @memberof module:jidejs/base/Animation
	 * @type {string}
	 */
	Animation.cssAnimationString = animationString;
	/**
	 * The prefix required for a css key frame.
	 * @memberof module:jidejs/base/Animation
	 * @type {string}
	 */
	Animation.cssKeyFramePrefix = keyFramePrefix;

	/**
	 * This animation method starts slowly and increases its pace until it runs very fast.
	 * @param {number} progress The progress of the animation, ranging from 0 to 1.
	 * @returns {number}
	 */
	Animation.easeIn = function(progress) {
		return Math.pow(progress, 2);
	};

	/**
	 * This animation method start fast and decreases its pace near the end of it.
	 * @param {number} progress The progress of the animation, ranging from 0 to 1.
	 * @returns {number}
	 */
	Animation.easeOut = function(progress) {
		return Math.pow(progress, 0.5);
	};

	/**
	 * This animation method runs linearly, never changing its pace.
	 * @param {number} progress The progress of the animation, ranging from 0 to 1.
	 * @returns {number}
	 */
	Animation.linear = function(progress) {
		return progress;
	};

	Class(Animation).def({
		/**
		 * The start time of the animation.
		 * @private
		 */
		startTime: 0,
		/**
		 * The duration of the animation in milliseconds.
		 *
		 * If the value of this field is *0* then this animation will run indefinitly until {@link module:jidejs/base/Animation#stop} is invoked.
		 *
		 * @type number
		 */
		duration: -1,
		/**
		 * A field that indicates whether the animation is currently stopped, i.e. not running.
		 * @type boolean
		 * @value *true*, if the animation isn't running; *false* otherwise.
		 */
		stopped: true,
		/**
		 * The method that should be used to interpolate the progress of the animation. The function set as the value
		 * must expect one parameter, a number ranging between 0 and 1, which signals the progress of the animation as a
		 * percentage (0 meaning the animation has just begun, 1 meaning the animation has finished), and return an
		 * interpolated number in the same range.
		 * @type Function
		 */
		method: Animation.linear,

		/**
		 * @private
		 */
		_deferred: null,

		/**
		 * Starts the animation.
		 * @return {Promise} A promise that is fulfilled when the animation has run.
		 */
		start: function() {
			this.startTime = window.performance && performance[now] && performance[now]() + performance.timing.navigationStart ||
				+new Date();
			this.stopped = false;
			Dispatcher.requestAnimationFrame(this.tick.bind(this));
			this._deferred = new Deferred();
			return this._deferred.promise;
		},

		/**
		 * Stops the animation and fulfills its promise with a value of *true*.
		 */
		stop: function() {
			this.stopped = true;
			this._deferred.fulfill(true);
		},

		/**
		 * @private
		 * @param time
		 */
		tick: function(time) {
			if(this.stopped) {
				return;
			}
			// queue another tick for best frame rate
			var frame = Dispatcher.requestAnimationFrame(this.tick.bind(this));

			var delay;
			var runningTime = (time - this.startTime);
			if(this.duration === 0) {
				// duration == 0 means "run until stop() is called"
				this.step(runningTime);
			} else if(runningTime > this.duration) {
				this.done();
				this.stop();
			} else {
				this.step(this.method(runningTime / this.duration));
			}

			if(this.stopped) {
				// abort the frame if this animation has stopped already
				frame.abort();
			}
		},

		// template methods
		/**
		 * Called for every frame of the animation and should modify the DOM or otherwise visually handle the animation
		 * progress.
		 * @param {number} progress The progress of the animation, ranging between 0 (just started) and 1 (finished)
		 * 							or the time that has passed since the animation has started to run if the animation
		 * 							runs indefinitely.
		 */
		step: function(progress) {},
		/**
		 * Invoked when the animation has finished.
		 */
		done: function() {}
	});

	return Animation;
});
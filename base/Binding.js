/**
 * A Binding happens between two observable values and takes care of keeping them in sync. There are two types of bindings:
 *
 * - ONE_WAY: Updates the target value whenever the source property changes
 * - TWO_WAY: Updates one value whenever the other changes.
 *
 * Note that it is usually not necessary to manually create an instance of Binding since all of the default observable
 * implementations support a method called `bind` which creates a Binding.
 *
 * @module jidejs/base/Binding
 */
define(['./Class'], function(Class) {
	/**
	 * Updates the target whenever the source changes.
	 *
	 * @param {module:jidejs/base/Property} source The source property
	 * @param {module:jidejs/base/Property} target The target property
	 * @param {Function} converter A function used to convert the value of the source property to a value that the
	 * 							   target property understands.
	 * @param {Binding.ONE_WAY|Binding.BIDIRECTIONAL} direction A flag to decide whether the binding is one way
	 * 															(source to target) or both ways.
	 * @constructor
	 * @alias module:jidejs/base/Binding
	 */
	var exports = function Binding(source, target, direction, converter) {
		this.sourceBinding = null;
		this.targetBinding = null;
		this.source = source;
		this.target = target;
		var updating = false;

		if(direction === Binding.ONE_WAY) {
			this.sourceBinding = source.subscribe(function() {
				if(updating) return;
				updating = true;
				target.set(converter
					? (converter.convertTo
						? converter.convertTo(source.get())
						: converter(source.get()))
					: source.get());
				updating = false;
			});
			updating = true;
			target.set(converter
				? (converter.convertTo
				? converter.convertTo(source.get())
				: converter(source.get()))
				: source.get());
			updating = false;
		} else if(direction === Binding.BIDIRECTIONAL) {
			this.sourceBinding = source.subscribe(function() {
				if(updating) return;
				updating = true;
				target.set(converter && converter.convertTo(source.get()) || source.get());
				updating = false;
			});
			this.targetBinding = target.subscribe(function() {
				if(updating) return;
				updating = true;
				source.set(converter && converter.convertFrom(target.get()) || target.get());
				updating = false;
			});
			updating = true;
			target.set(converter && converter.convertTo(source.get()) || source.get());
			updating = false;
		}
	};
	Class(Binding).def(/** @lends module:jidejs/base/Binding# */{
		/**
		 * Releases all references stored in the binding to clear up the used memory.
		 */
		dispose: function() {
			if(this.sourceBinding) this.sourceBinding.dispose();
			if(this.targetBinding) this.targetBinding.dispose();
			this.sourceBinding = null;
			this.targetBinding = null;
			this.source = null;
			this.target = null;
		}
	});
	/**
	 * A flag to indicate that the Binding should work only in one direction, updating the target whenever
	 * the source property changes.
	 *
	 * @type {number}
	 */
    exports.ONE_WAY = 1;
	/**
	 * A flag to indicate that the Binding should work only in one direction, updating both properties whenever the other
	 * one changes.
	 *
	 * @type {number}
	 */
    exports.BIDIRECTIONAL = 2;

	return exports;
});
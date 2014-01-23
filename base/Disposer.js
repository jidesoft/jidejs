/**
 * The Disposer is used to store multiple disposable objects and dispose of all of them at once.
 *
 * @module jidejs/base/Disposer
 */
define([
	'./Class'
], function(Class) {
	"use strict";

	function dispose(disposable) {
		disposable.dispose();
	}

	/**
	 * Creates a new Disposer.
	 *
	 * @memberof module:jidejs/base/Disposer
	 * @constructor
	 * @class
	 * @alias module:jidejs/base/Disposer
	 */
	function Disposer() {
		this.disposables = [];
	}
	Class(Disposer).def({
		/**
		 * Adds a new disposable that should be managed by this disposer.
		 * @param {{dispose:function}} disposable The disposable object.
		 * @returns module:jidejs/base/Disposer
		 */
		add: function(disposable) {
			this.disposables.push(disposable);
			return this;
		},

		/**
		 * Disposes of all managed disposables at once.
		 */
		dispose: function() {
			this.disposables.forEach(dispose);
			this.disposables = [];
		}
	});
	return Disposer;
});
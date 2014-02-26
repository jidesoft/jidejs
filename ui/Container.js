/**
 * This module is a mixin that supports managing children within a {@link jidejs/ui/Component}.
 * It is not necessary to actually mixin this class, just invoke the constructor.
 *
 * You can either provide a `wrapperCallback` function to the constructor which returns an `Element` that should be
 * placed directly within the components element, or you can implement the methods `_insertChildAt` and `_removeChild`
 * for more flexibility.
 *
 * @example
 * function MyComponent() {
 * 	Container.call(this, function(component) { return component.element; });
 * }
 *
 * @module jidejs/ui/Container
 */
define([
	'./../base/Class', './../base/ObservableList', './../base/DOM'
], function(Class, ObservableList, DOM) {
	"use strict";
	function handleChildrenChangedInsertAt(event) {
		var changes = event.enumerator(),
			component;
		while(changes.moveNext()) {
			var change = changes.current;
			if(change.isUpdate) {
				component = change.oldValue;
				component.parent = null;
				this._removeChild(component);
				component = change.newValue;
				this._insertChildAt(component, change.index);
				component.parent = this;
			} else if(change.isInsert) {
				component = change.newValue;
				this._insertChildAt(component, change.index);
				component.parent = this;
			} else {
				component = change.oldValue;
				component.parent = null;
				this._removeChild(component);
			}
		}
		if(this.requestLayout) this.requestLayout();
	}

	function handleChildrenChanged(wrapperCallback, event) {
		var changes = event.enumerator(),
			element = this.element,
			component;
		while(changes.moveNext()) {
			var change = changes.current;
			if(change.isUpdate) {
				var oldElement = changed.oldValue.element;
				oldElement.parentNode.replaceChild(changes.newValue.element, oldElement);
				element.replaceChild(changes.newValue.element, changes.oldValue.element);
				changes.oldValue.parent = null;
				changes.newValue.parent = this;
			} else if(change.isInsert) {
				component = changes.newValue;
				component.parent = this;
				DOM.insertElementAt(element, component.element, change.index);
			} else {
				component = changes.oldValue;
				component.parent = null;
				element.removeChild(component.element);
			}
		}
		if(this.requestLayout) this.requestLayout();
	}

	/**
	 * Initializes a new container, observing the `children` {@link module:jidejs/base/ObservableList}.
	 *
	 * You must call this method using the `call` method to change the context to the component you're developing.
	 *
	 * For simple usages, it is sufficient to use the `wrapperCallback` argument. More complicated usages will require
	 * the implementation of the `_insertChildAt` and `_removeChild` methods.
	 *
	 * This class will take care of managing the `parent` property of the children as well as optimizing the addition of
	 * children if the `_insertChildAt` and `_removeChild` are not implemented.
	 *
	 * It will also invoke the `requestLayout` method when required and available.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/Container
     *
     * @param {function?} wrapperCallback An optional callback that can be used to nest children in additional elements.
	 */
	function Container(wrapperCallback) {
		if(!this.children) {
			this.children = new ObservableList();
		}
		if(this._insertChildAt) {
			this.children.on('change', handleChildrenChangedInsertAt.bind(this));
		} else {
			this.children.on('change', handleChildrenChanged.bind(this, wrapperCallback));
		}
	}
    var Container = exports;
	Class(Container).def(/** @lends module:jidejs/ui/Container# */{
		/**
		 * An ObservableList of children that belong to the component.
		 * @type {module:jidejs/base/Collection}
		 */
		children: null,

		/**
		 * Inserts the child at the specified index.
		 * @param {module:jidejs/ui/Component} child The new child
		 * @param {number} index The index at which the new child should be inserted
		 * @protected
		 * @abstract
		 */
		_insertChildAt: function(child, index) {
			// not implemented
		},

		/**
		 * Removes the given child from the component.
		 * @param {module:jidejs/ui/Component} child The child that should be removed.
		 * @protected
		 * @abstract
		 */
		_removeChild: function(child) {
			// not implemented
		}
	});
	return Container;
});
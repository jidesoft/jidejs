/**
 * The ClassList module is used to provide cross browser access to the HTML5 `classList` API
 * and can be used to add and remove classes from an element in an easy and efficient way.
 *
 * In addition to the standard `classList` API, it is also {@link module:jidejs/base/Observable}.
 *
 * @module jidejs/ui/util/ClassList
 */
define(['./../../base/Class', './../../base/ObservableProperty'], function(Class, Observable) {
	var hasClassList = ('classList' in document.createElement('span'));
	var classListShim = {
		add: function(name) {
			if(this.classes.indexOf(name) === -1) {
				this.classes.push(name);
				this.element.className = this.toString();
				this.emit('changed', name);
			}
		},

		remove: function(name) {
			var index = this.classes.indexOf(name);
			if(index !== -1) {
				this.classes.splice(index, 1);
				this.element.className = this.toString();
				this.emit('changed', name);
			}
		},

		contains: function(name) {
			return this.classes.indexOf(name) !== -1;
		},

		get length() {
			return this.classes.length;
		},

		toggle: function(name) {
			if(this.contains(name)) {
				this.remove(name);
			} else {
				this.add(name);
			}
		},

		toString: function() {
			return this.classes.join(" ");
		}
	};

	/**
	 * Creates a new ClassList. Will pick the best implementation available, i.e. either one based on the native
	 * `classList` API or a compatibility layer which works on old and incompatible APIs.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/util/ClassList
     *
     * @param {HTMLElement} element
	 */
	var exports = function ClassList(element) {
		installer(this);
		this.element = element;
		if(!('classList' in element)) {
			this.classes = element.className.split(/\w+/);
			Class(this).def(classListShim);
		}
	};
    var ClassList = exports;
	var installer = Observable.install(ClassList, 'changed');

	var classDef = Class(ClassList);
	if(hasClassList) {
		classDef.def(/** @lends module:jidejs/ui/util/ClassList# */{
			/**
			 * Adds the given class name to the class list.
			 * @param {string} name The name of the class.
			 * @memberof module:jidejs/ui/util/ClassList#
			 */
			add: function(name) {
				this.element.classList.add(name);
				this.emit('changed', name);
			},

			/**
			 * Removes the given class name from the class list.
			 * @param {string} name The name of the class.
			 * @memberof module:jidejs/ui/util/ClassList#
			 */
			remove: function(name) {
				this.element.classList.remove(name);
				this.emit('changed', name);
			},

			/**
			 * Returns `true`, if the class name is contained in the class list, `false` otherwise.
			 * @param {string} name The name of the class.
			 * @returns {boolean}
			 * @memberof module:jidejs/ui/util/ClassList#
			 */
			contains: function(name) {
				return this.element.classList.contains(name);
			},

			/**
			 * Contains the number of classes in the class list.
			 * @readonly
			 * @returns {Number}
			 * @memberof module:jidejs/ui/util/ClassList#
			 */
			get length() {
				return this.element.classList.length;
			},

			/**
			 * Toggles the state of a class, i.e. removes it if it is already contained or adds it if it is not.
			 * @param {string} name The name of the class.
			 * @memberof module:jidejs/ui/util/ClassList#
			 */
			toggle: function(name) {
				this.element.classList.toggle(name);
			},

			/**
			 * Converts the class list into a string.
			 * @memberof module:jidejs/ui/util/ClassList#
			 * @returns {string}
			 */
			toString: function() {
				return this.element.classList.toString();
			}
		});
	} else {
		classDef.def(classListShim);
	}

	classDef.def(/** @lends module:jidejs/ui/util/ClassList# */{
		bind: function(name, property) {
			return property.subscribe(function(event) {
				this[event.value ? 'add' : 'remove'](name);
			}.bind(this));
		}
	});

	return ClassList;
});
/**
 * This module contains commonly used calculated {@link module:jidejs/base/Observable} bindings.
 *
 * It can be used to create conditional properties whose value changes when a boolean {@link module:jidejs/base/Observable}
 * changes, or to retrieve the length of a list, the value of two combined number properties and so on.
 *
 * @module jidejs/base/Bindings
 * @deprecated Will be removed in 1.0.0 final, use {@link module:jidejs/base/Observable} directly.
 */
define([
	'./Observable'
], function(Observable) {
	var exports = {
        /**
         * Creates an Observable whose value is resolved asynchronously.
         * The `callback` will receive the original observable and is expected to return
         * a Promise. Once that Promise is resolved, the value of the new observable will
         * be changed to the value that the Promise was resolved too.
         *
         * @example
         * // this example demonstrates how to limit evaluation to the animation frame.
         * Observable.computed(function() {
         *     return 2 * 2; // slow calculation
         * }).async(function(resultObservable) {
         *     var defer = new Deferred();
         *     Dispatcher.requestAnimationFrame(function() {
         *         defer.fulfill(resultObservable.get());
         *     });
         *     return defer.promise;
         * }).subscribe(function(event) {
         *     // do something with event.value
         * });
         *
         * @param {Function} callback
         * @returns {Observable}
         */
        async: function(arg, callback) {
            return Observable.prototype.async.apply(null, arguments);
        },

        /**
         * This type of binding can be used to create a property whose value changes when the bound property
         * takes a truthy or falsy value.
         *
         * A _truthy_ value is anything that can be coerced into the boolean _true_ value, i.e. strings, objects, functions and
         * the boolean value _true_.
         *
         * A _falsy_ value is anything that can be coerced into the boolean _false_ value, i.e. _undefined_, _null_ and
         * the boolean value _false_.
         *
         * The return value of this method is a builder that helps with the process of creating such a conditional binding.
         * The first return value provides an object with a _then_ method that expects the value of the property that
         * should be used if the condition is truthy and returns an object with an _otherwise_ method that expects the
         * value that should be used if the condition is falsy and returns the created conditional property.
         *
         * If the _then_ or _otherwise_ values are {@link jidejs/base/Property properties} then their current value will
         * be extracted (using its _get_ method) and used as the value of the conditional property.
         *
         * @example
         * var motorControlLightColorProperty = myObservable
         * 		.when(car.isMotorRunningProperty)
         * 			.then('red')
         * 			.otherwise('blue');
         *
         * @param {jidejs/base/Observable} condition A property whose value is either truthy or falsy.
         * @returns {{then: Function}} The conditional property builder.
         */
        when: function(condition) {
            return Observable.prototype.when.apply(null, arguments);
        },

        /**
         * Expects a list of {@link module:jidejs/base/Observable number properties} or numbers and returns
         * a {@link module:jidejs/base/Observable} that consists of their total sum.
         *
         * @param {...module:jidejs/base/Observable|number} numbers
         * @returns {module:jidejs/base/Observable} The generated property
         */
        add: function(numbers) {
            return Observable.prototype.add.apply(null, arguments);
        },

        /**
         * Returns a new Observable property whose value is the result of subtracting all given properties.
         *
         * @param {...module:jidejs/base/Observable|number} numbers
         * @returns {module:jidejs/base/Observable} The generated property
         */
        subtract: function() {
            return Observable.prototype.subtract.apply(null, arguments);
        },

        /**
         * Returns a new Observable property whose value is the result of the multiplication of all given properties.
         *
         * @param {...jidejs/base/Property|*} values
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        multiply: function() {
            return Observable.prototype.multiply.apply(null, arguments);
        },

        /**
         * Returns a new Observable property whose value is the result of a logical `and` of all given properties.
         * As with Javascript in general, this means that if all values are truthy, the value of the new property
         * will be the value of the last given property.
         *
         * @example
         * var first = Observable(true), second = Observable(true), third = Observable({ msg: 'Hello World' });
         * var cond = Bindings.and(first, second, third);
         * console.log(cond.get().msg); // => 'Hello World'
         *
         * @param {...jidejs/base/Property|*} values
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        and: function() {
            return Observable.prototype.and.apply(null, arguments);
        },

        /**
         * Returns a new property whose value is the result of a logical `or` of all given properties.
         *
         * @param {...jidejs/base/Property|*} values
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        or: function() {
            return Observable.prototype.or.apply(null, arguments);
        },

        /**
         * Creates a {@link module:jidejs/base/Property} whose value is the item of the given
         * {@link module:jidejs/base/ObservableList} or {@link module:jidejs/base/ObservableMap} and updates whenever
         * the item stored at the given index is modified.
         *
         * @param {jidejs/base/ObservableList|jidejs/base/ObservableMap} listOrMap The list or map where the item is stored
         * @param {number|string} index The index of the item in the list or map.
         * @returns {jidejs/base/Property}
         */
        valueAt: function(listOrMap, index) {
            return Observable.prototype.valueAt.apply(null, arguments);
        },

        /**
         * Returns a new property whose value is the result of concatenating all given properties.
         * This operation performs only string concatenations.
         *
         * @param {...jidejs/base/Property|String} values
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        concat: function() {
            return Observable.prototype.concat.apply(null, arguments);
        },

        /**
         * Returns a new property whose value is the result of applying `fn` to the value of `property`.
         *
         * @param {...jidejs/base/Property|*} property
         * @param {Function} fn The function that is applied to the value of `property`.
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        map: function(property, fn) {
            return Observable.prototype.map.call(null, property, fn);
        },

        tag: function(tag, property) {
            return Observable.prototype.tag.call(null, tag, property);
        },

        /**
         * Returns a new property whose value is the result of the division of all given properties.
         *
         * @param {...module:jidejs/base/Observable|number} values
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        divide: function() {
            return Observable.prototype.divide.apply(null, arguments);
        },

        /**
         * Returns a new property whose value is `true`, if the value of `op1` is equal to `op2`; `false`, otherwise.
         *
         * @param {module:jidejs/base/Observable|*} op1 The first Observable or value.
         * @param {module:jidejs/base/Observable|*} op2 The second Observable or value.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        equal: function(op1, op2) {
            return Observable.prototype.equal.call(null, op1, op2);
        },

        /**
         * Returns a new property whose value is `true`, if the value of `op1` is not equal to `op2`; `false`, otherwise.
         *
         * @param {module:jidejs/base/Observable|*} op1 The first Observable or value.
         * @param {module:jidejs/base/Observable|*} op2 The second Observable or value.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        notEqual: function(op1, op2) {
            return Observable.prototype.notEqual.call(null, op1, op2);
        },

        /**
         * Returns a new property whose value is `false`, if the value of the property
         * is `falsy` (i.e. `undefined`, `null`, `false`, ...); `true`, otherwise.
         *
         * @param {module:jidejs/base/Observable} prop The property.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        not: function(prop) {
            return Observable.prototype.not.call(null, prop);
        },

        /**
         * Returns a new property whose value is the bitwise negation of the value of the given property.
         *
         * @param {module:jidejs/base/Observable} prop The property.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        negate: function(prop) {
            return Observable.prototype.negate.call(null, prop);
        },

        convert: function(prop, converter) {
            return Observable.prototype.convert.call(null, prop, converter);
        },

        /**
         * Returns a property whose value is `true`, if `op1` is greater than `op2`; `false`, otherwise.
         *
         * @param {module:jidejs/base/Observable} op1 The property that is assumed to be larger.
         * @param {module:jidejs/base/Observable} op2 The property that is assumed to be smaller.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        greaterThan: function(op1, op2) {
            return Observable.prototype.greaterThan.call(null, op1, op2);
        },

        /**
         * Returns a property whose value is `true`, if `op1` is greater than or equal to `op2`; `false`, otherwise.
         *
         * @param {module:jidejs/base/Observable} op1 The property that is assumed to be larger.
         * @param {module:jidejs/base/Observable} op2 The property that is assumed to be smaller.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        greaterThanOrEqual: function(op1, op2) {
            return Observable.prototype.greaterThanOrEqual.call(null, op1, op2);
        },

        /**
         * Returns a property whose value is `true`, if `op1` is smaller than `op2`; `false`, otherwise.
         *
         * @param {module:jidejs/base/Observable} op1 The property that is assumed to be smaller.
         * @param {module:jidejs/base/Observable} op2 The property that is assumed to be larger.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        lessThan: function(op1, op2) {
            return Observable.prototype.lessThan.call(null, op1, op2);
        },

        /**
         * Returns a property whose value is `true`, if `op1` is smaller than or equal to `op2`; `false`, otherwise.
         *
         * @param {module:jidejs/base/Observable} op1 The property that is assumed to be smaller.
         * @param {module:jidejs/base/Observable} op2 The property that is assumed to be larger.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        lessThanOrEqual: function(op1, op2) {
            return Observable.prototype.lessThanOrEqual.call(null, op1, op2);
        },

        /**
         * Returns a property whose value is the largest of the given properties.
         *
         * @param {module:jidejs/base/Observable|number} op1 The property.
         * @param {module:jidejs/base/Observable|number} op2 The property.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        max: function(op1, op2) {
            return Observable.prototype.max.call(null, op1, op2);
        },

        /**
         * Returns a property whose value is the smallest of the given properties.
         *
         * @param {module:jidejs/base/Observable} op1 The property.
         * @param {module:jidejs/base/Observable} op2 The property.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        min: function(op1, op2) {
            return Observable.prototype.min.call(null, op1, op2);
        },

        /**
         * Returns a new property whose value is the result of selecting a path of properties.
         *
         * @example
         * var firstName = app.select('listProperty', 'selectionModelProperty', 'selectedItemProperty', 'nameProperty', 'firstNameProperty');
         * // is equivalent to
         * firstName = Observable.computed(function() {
		 *   return app.list.selectionModel.selectedItem.name.firstName;
		 * });
         *
         * @param {module:jidejs/base/Observable} context The root of the path.
         * @param {...string} path The path to the destination property.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        select: function(context) {
            return context.select.apply(context, [].slice.apply(arguments, 1));
        }
    };
    return exports;
});
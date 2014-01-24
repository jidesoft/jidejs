/**
 * This module contains commonly used calculated {@link module:jidejs/base/Property} bindings.
 *
 * It can be used to create conditional properties whose value changes when a boolean {@link module:jidejs/base/Property}
 * changes, or to retrieve the length of a list, the value of two combined number properties and so on.
 *
 * @module jidejs/base/Bindings
 * @requires module:jidejs/base/DependencyProperty
 */
define([
	'./Observable'
], function(Observable) {
	return Observable.Bindings;
});